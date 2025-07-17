class ExcelImportService
  def initialize(file_path)
    @file_path = file_path
  end

  def parse_candidates
    ext = File.extname(@file_path)
    candidates = []

    if ext == ".csv"
      parse_csv(candidates)
    else
      parse_excel(candidates)
    end

    # ✅ Convert all keys to string before returning
    candidates.map { |c| c.transform_keys(&:to_s) }
  end

  private

  def parse_csv(candidates)
    CSV.foreach(@file_path, headers: true, header_converters: :symbol) do |row|
      name = row[:name]
      email = row[:email]
      candidates << { name: name, email: email } if name.present? && email.present?
    end
  end


  def parse_excel(candidates)
    xlsx = Roo::Spreadsheet.open(@file_path)
    sheet = xlsx.sheet(0)

    sheet.each_row_streaming(offset: 1) do |row|
      name = row[0]&.cell_value
      email = row[1]&.cell_value
      candidates << { name: name, email: email } if name.present? && email.present?
    end
  end
end
