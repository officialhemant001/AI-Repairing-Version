"""
OCR (Optical Character Recognition) module.
Extracts specifications, labels, and text from manuals/labels using AI Vision.
"""
import logging
from ai_engine.providers import get_ai_provider

logger = logging.getLogger(__name__)


def extract_text_from_image(image_file):
    """
    Performs OCR on an image (e.g., appliance label or manual page)
    using the active AI Vision provider.
    """
    if not image_file:
        return ''

    try:
        provider = get_ai_provider()
        prompt = """Analyze this image containing text (label, manual, schematic, or screen).
Extract all readable text, model numbers, serial numbers, electrical ratings (voltage, wattage, current), and safety warnings.
Provide a clean, formatted Markdown output of the extracted information.
If no text is found, simply reply with "No text detected." """

        system_instruction = "You are a professional OCR text extractor."
        extracted_text = provider.analyze_image(
            image_file=image_file,
            prompt=prompt,
            system_instruction=system_instruction,
        )

        logger.info('OCR completed. Length: %d characters', len(extracted_text))
        return extracted_text.strip()
    except Exception as e:
        logger.error('OCR failed: %s', e)
        return ''
