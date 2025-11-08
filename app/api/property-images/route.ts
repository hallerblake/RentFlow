import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { put } from '@vercel/blob';

// GET /api/property-images?propertyId=xxx - Get all images for a property
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Verify property belongs to user's company (multi-tenant security)
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        companyId: session.selectedCompanyId || '',
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 404 }
      );
    }

    // Fetch all images for this property
    const images = await prisma.propertyImage.findMany({
      where: {
        propertyId,
        companyId: session.selectedCompanyId || '',
      },
      orderBy: [
        { isPrimary: 'desc' }, // Primary image first
        { createdAt: 'asc' },   // Then by upload date
      ],
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('[PROPERTY_IMAGES_GET]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/property-images - Upload a new property image
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session.selectedCompanyId) {
      return NextResponse.json(
        { error: 'No company selected' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Verify property belongs to user's company (multi-tenant security)
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        companyId: session.selectedCompanyId,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 404 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename with company and property organization
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobPath = `property-images/${session.selectedCompanyId}/${propertyId}/${timestamp}-${sanitizedFileName}`;

    // Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public',
    });

    // If this is set as primary, unset other primary images
    if (isPrimary) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId,
          companyId: session.selectedCompanyId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Save image metadata to database
    const propertyImage = await prisma.propertyImage.create({
      data: {
        companyId: session.selectedCompanyId,
        propertyId,
        url: blob.url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        isPrimary,
      },
    });

    return NextResponse.json(propertyImage, { status: 201 });
  } catch (error) {
    console.error('[PROPERTY_IMAGES_POST]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
