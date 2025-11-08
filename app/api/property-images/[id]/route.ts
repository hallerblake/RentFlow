import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { del } from '@vercel/blob';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// PATCH /api/property-images/[id] - Update image (e.g., set as primary)
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    const { id } = await params;
    const body = await request.json();

    if (!session.selectedCompanyId) {
      return NextResponse.json(
        { error: 'No company selected' },
        { status: 400 }
      );
    }

    // Verify image belongs to user's company (multi-tenant security)
    const image = await prisma.propertyImage.findFirst({
      where: {
        id,
        companyId: session.selectedCompanyId,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found or access denied' },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary images for this property
    if (body.isPrimary === true) {
      await prisma.propertyImage.updateMany({
        where: {
          propertyId: image.propertyId,
          companyId: session.selectedCompanyId,
          isPrimary: true,
          id: { not: id },
        },
        data: {
          isPrimary: false,
        },
      });
    }

    // Update the image
    const updatedImage = await prisma.propertyImage.update({
      where: { id },
      data: {
        isPrimary: body.isPrimary ?? image.isPrimary,
      },
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error('[PROPERTY_IMAGE_PATCH]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/property-images/[id] - Delete a property image
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session.selectedCompanyId) {
      return NextResponse.json(
        { error: 'No company selected' },
        { status: 400 }
      );
    }

    // Verify image belongs to user's company (multi-tenant security)
    const image = await prisma.propertyImage.findFirst({
      where: {
        id,
        companyId: session.selectedCompanyId,
      },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found or access denied' },
        { status: 404 }
      );
    }

    // Delete from Vercel Blob
    try {
      await del(image.url);
    } catch (blobError) {
      console.error('[BLOB_DELETE_ERROR]', blobError);
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await prisma.propertyImage.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('[PROPERTY_IMAGE_DELETE]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
