import re
import zlib
import zipfile
import xml.etree.ElementTree as ET
from io import BytesIO

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """
    Extract text content from PDF or DOCX file bytes.
    Pure Python, zero-external-dependency implementation.
    """
    if not file_bytes:
        return ""

    lower_name = filename.lower()

    if lower_name.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    elif lower_name.endswith(".pdf") or file_bytes.startswith(b"%PDF-"):
        return extract_text_from_pdf(file_bytes)
    else:
        try:
            return file_bytes.decode("utf-8", errors="ignore").strip()
        except Exception:
            return ""

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX XML."""
    try:
        with zipfile.ZipFile(BytesIO(file_bytes)) as docx_zip:
            xml_content = docx_zip.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            # Namespace for wordprocessingml
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            paragraphs = []
            for p in tree.findall(".//w:p", ns):
                texts = [node.text for node in p.findall(".//w:t", ns) if node.text]
                if texts:
                    paragraphs.append("".join(texts))
            return "\n".join(paragraphs).strip()
    except Exception as exc:
        # Fallback string extraction
        try:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
            cleaned = re.sub(r"<[^>]+>", " ", raw_text)
            return re.sub(r"\s+", " ", cleaned).strip()
        except Exception:
            return ""

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text from PDF streams and content blocks using pure Python standard library.
    Handles FlateDecode compressed streams and direct Tj / TJ text operators.
    """
    extracted_text = []

    # 1. Search for PDF streams
    stream_pattern = re.compile(b"stream[\r\n]+(.*?)[\r\n]+endstream", re.DOTALL)
    streams = stream_pattern.findall(file_bytes)

    for stream in streams:
        decompressed = b""
        try:
            decompressed = zlib.decompress(stream)
        except Exception:
            try:
                # Some PDFs use zlib raw deflate without header
                decompressed = zlib.decompress(stream, -zlib.MAX_WBITS)
            except Exception:
                decompressed = stream

        text_chunk = parse_pdf_text_operators(decompressed)
        if text_chunk:
            extracted_text.append(text_chunk)

    full_result = "\n".join(extracted_text).strip()

    # Fallback if streams didn't contain clean text operators
    if len(full_result) < 30:
        raw_strings = re.findall(rb"\(([^()]{2,})\)", file_bytes)
        recovered = [s.decode("latin1", errors="ignore") for s in raw_strings if len(s) > 2]
        if recovered:
            full_result = " ".join(recovered)

    return clean_extracted_text(full_result)

def parse_pdf_text_operators(stream_bytes: bytes) -> str:
    """Parse PDF text operators like Tj, TJ, ', and \" from a content stream."""
    lines = []
    # Tj operator: (string) Tj
    tj_matches = re.findall(rb"\(((?:\\.|[^()])*)\)\s*Tj", stream_bytes)
    for m in tj_matches:
        decoded = decode_pdf_escapes(m.decode("latin1", errors="ignore"))
        if decoded.strip():
            lines.append(decoded)

    # TJ operator: [(string) -100 (another)] TJ
    tj_array_matches = re.findall(rb"\[((?:\\.|[^\[\]])*)\]\s*TJ", stream_bytes)
    for array_content in tj_array_matches:
        parts = re.findall(rb"\(((?:\\.|[^()])*)\)", array_content)
        joined = "".join([decode_pdf_escapes(p.decode("latin1", errors="ignore")) for p in parts])
        if joined.strip():
            lines.append(joined)

    return "\n".join(lines)

def decode_pdf_escapes(s: str) -> str:
    """Unescape PDF octal and special escapes."""
    s = s.replace(r"\(", "(").replace(r"\)", ")").replace(r"\\", "\\")
    s = s.replace(r"\r", "\r").replace(r"\n", "\n").replace(r"\t", "\t")
    return s

def clean_extracted_text(text: str) -> str:
    """Normalize whitespace and punctuation in extracted text."""
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()
