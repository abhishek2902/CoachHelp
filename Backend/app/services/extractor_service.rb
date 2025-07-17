# app/services/extractor_service.rb
require 'pdf-reader'
require 'docx'
require 'rtesseract'

class ExtractorService
  def self.extract_text(file)
    ext = File.extname(file.original_filename).downcase

    case ext
    when '.pdf'
      extract_pdf(file)
    when '.docx'
      extract_docx(file)
    when '.txt'
      extract_txt(file)
    when '.jpg', '.jpeg', '.png'
      extract_image(file)
    else
      raise "Unsupported file type: #{ext}"
    end
  end

  def self.extract_pdf(file)
    text = ""
    begin
      reader = PDF::Reader.new(file.path)
      reader.pages.each { |page| text << page.text }
      return text unless text.strip.empty?
    rescue
      # Fallback to OCR if PDF::Reader fails (scanned PDF)
    end
    extract_image(file) # Use OCR as fallback
  end

  def self.extract_docx(file)
    doc = Docx::Document.open(file.path)
    doc.paragraphs.map(&:text).join("\n")
  end

  def self.extract_txt(file)
    file.read
  end

  def self.extract_image(file)
    image = RTesseract.new(file.path)
    image.to_s
  end
end
