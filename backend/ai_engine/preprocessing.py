"""
Image preprocessing module.
Optimizes uploaded device photos for computer vision analysis.
"""
import logging
import io
from PIL import Image, ImageOps, ImageEnhance
from django.core.files.uploadedfile import InMemoryUploadedFile

logger = logging.getLogger(__name__)


def preprocess_image(uploaded_file, max_dimension=1024, quality=85):
    """
    Preprocesses an uploaded image file:
    1. Corrects orientation based on EXIF tags.
    2. Resizes image if it exceeds max_dimension while maintaining aspect ratio.
    3. Enhances contrast and sharpness slightly for better component details.
    4. Compresses to JPEG.

    Returns an InMemoryUploadedFile object.
    """
    if not uploaded_file:
        return None

    try:
        # Open image
        image = Image.open(uploaded_file)

        # 1. Correct orientation from EXIF
        try:
            image = ImageOps.exif_transpose(image)
        except Exception as e:
            logger.debug('Exif transpose failed: %s', e)

        # Convert to RGB if in other mode
        if image.mode != 'RGB':
            image = image.convert('RGB')

        # 2. Resize maintaining aspect ratio
        width, height = image.size
        if width > max_dimension or height > max_dimension:
            if width > height:
                new_width = max_dimension
                new_height = int((height / width) * max_dimension)
            else:
                new_height = max_dimension
                new_width = int((width / height) * max_dimension)

            logger.info('Resizing image from %dx%d to %dx%d', width, height, new_width, new_height)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # 3. Enhance image contrast slightly for details
        try:
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.1)  # 10% boost
        except Exception as e:
            logger.debug('Image enhancement failed: %s', e)

        # 4. Save to buffer as JPEG
        output_buffer = io.BytesIO()
        image.save(output_buffer, format='JPEG', quality=quality)
        output_buffer.seek(0)

        # Re-create InMemoryUploadedFile
        preprocessed_file = InMemoryUploadedFile(
            file=output_buffer,
            field_name=uploaded_file.field_name,
            name=f'{uploaded_file.name.split(".")[0]}.jpg',
            content_type='image/jpeg',
            size=output_buffer.getbuffer().nbytes,
            charset=None,
        )

        logger.info('Image preprocessed. Old size: %d bytes, New size: %d bytes',
                    uploaded_file.size, preprocessed_file.size)

        return preprocessed_file

    except Exception as e:
        logger.error('Failed to preprocess image: %s', e)
        # Fall back to original file if processing fails
        uploaded_file.seek(0)
        return uploaded_file
