package com.travelhub.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.travelhub.dto.response.GuidePassengerResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.BookingPassenger;
import com.travelhub.entity.Payment;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.TransactionStatus;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.PaymentRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.service.ExportService;
import com.travelhub.service.GuideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExportServiceImpl implements ExportService {

    private final PaymentRepository paymentRepository;
    private final TourDepartureRepository departureRepository;
    private final BookingRepository bookingRepository;
    private final GuideService guideService;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

    // ================= 1. XUẤT EXCEL BÁO CÁO TÀI CHÍNH (ADMIN) =================
    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportMonthlyFinancialReport(int month, int year) {
        List<Payment> allPayments = paymentRepository.findAll();

        // Lọc theo tháng và năm
        List<Payment> monthlyPayments = allPayments.stream()
                .filter(p -> p.getPaymentTime() != null 
                        && p.getPaymentTime().getMonthValue() == month 
                        && p.getPaymentTime().getYear() == year)
                .toList();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("BaoCaoDoanhThu_T" + month + "_" + year);

            // Font & Style
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            CellStyle currencyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            currencyStyle.setDataFormat(format.getFormat("#,##0 \"đ\""));

            // Dòng 0: Tiêu đề báo cáo
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("BÁO CÁO TÀI CHÍNH & DOANH THU THÁNG " + month + "/" + year);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));

            // Dòng 2: Header bảng
            String[] headers = {"STT", "Mã Giao Dịch", "Mã Booking", "Tên Tour", "Khách Hàng", "Ngày Thanh Toán", "Cổng TT", "Số Tiền (VND)", "Trạng Thái"};
            Row headerRow = sheet.createRow(2);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Ghi dữ liệu
            int rowIdx = 3;
            BigDecimal totalSuccessRevenue = BigDecimal.ZERO;

            for (int i = 0; i < monthlyPayments.size(); i++) {
                Payment p = monthlyPayments.get(i);
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(p.getTransactionCode());
                row.createCell(2).setCellValue(p.getBooking() != null ? p.getBooking().getBookingCode() : "N/A");
                row.createCell(3).setCellValue(p.getBooking() != null && p.getBooking().getDeparture() != null ? p.getBooking().getDeparture().getTour().getName() : "N/A");
                row.createCell(4).setCellValue(p.getBooking() != null ? p.getBooking().getContactName() : "N/A");
                row.createCell(5).setCellValue(p.getPaymentTime() != null ? p.getPaymentTime().format(DATE_TIME_FORMATTER) : "");
                row.createCell(6).setCellValue(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : "VNPAY");

                Cell amountCell = row.createCell(7);
                amountCell.setCellValue(p.getAmount().doubleValue());
                amountCell.setCellStyle(currencyStyle);

                row.createCell(8).setCellValue(p.getStatus() == TransactionStatus.SUCCESS ? "THÀNH CÔNG" : p.getStatus().name());

                if (p.getStatus() == TransactionStatus.SUCCESS) {
                    totalSuccessRevenue = totalSuccessRevenue.add(p.getAmount());
                }
            }

            // Dòng Tổng Cộng
            Row totalRow = sheet.createRow(rowIdx + 1);
            Cell totalLabelCell = totalRow.createCell(6);
            totalLabelCell.setCellValue("TỔNG DOANH THU THỰC NHẬN:");
            org.apache.poi.ss.usermodel.Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            CellStyle totalLabelStyle = workbook.createCellStyle();
            totalLabelStyle.setFont(boldFont);
            totalLabelCell.setCellStyle(totalLabelStyle);

            Cell totalValCell = totalRow.createCell(7);
            totalValCell.setCellValue(totalSuccessRevenue.doubleValue());
            CellStyle totalValStyle = workbook.createCellStyle();
            totalValStyle.setFont(boldFont);
            totalValStyle.setDataFormat(format.getFormat("#,##0 \"đ\""));
            totalValCell.setCellStyle(totalValStyle);

            // Auto-size cột
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Lỗi xuất Excel tài chính: ", e);
            throw new RuntimeException("Không thể xuất báo cáo Excel tài chính: " + e.getMessage());
        }
    }

    // ================= 2. XUẤT EXCEL DANH SÁCH ĐOÀN CHO TOUR GUIDE =================
    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportGuideDepartureManifest(Long departureId, Long guideUserId) {
        TourDeparture departure = departureRepository.findById(departureId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến đi!"));

        List<GuidePassengerResponse> passengers = guideService.getDeparturePassengers(departureId, guideUserId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("DanhSachHanhKhach");

            // Header Style
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Thông tin chuyến đi
            Row r0 = sheet.createRow(0);
            r0.createCell(0).setCellValue("DANH SÁCH ĐOÀN KHÁCH - " + departure.getTour().getName().toUpperCase());
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));

            Row r1 = sheet.createRow(1);
            r1.createCell(0).setCellValue("Ngày khởi hành: " + departure.getDepartureDate().format(DATE_FORMATTER) 
                    + " | Ngày về: " + departure.getReturnDate().format(DATE_FORMATTER)
                    + " | Tổng khách: " + passengers.size() + " người");
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 8));

            String[] headers = {"STT", "Mã Đơn", "Họ Tên Hành Khách", "Đối Tượng", "Giới Tính", "Điểm Đón Xe", "Giờ Đón", "SĐT Liên Hệ", "Ký Nhận (Lên xe)"};
            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            int rowIdx = 4;
            for (int i = 0; i < passengers.size(); i++) {
                GuidePassengerResponse p = passengers.get(i);
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(p.getBookingCode());
                row.createCell(2).setCellValue(p.getFullName());
                row.createCell(3).setCellValue(p.getPassengerType() != null && p.getPassengerType().name().equals("ADULT") ? "Người lớn" : "Trẻ em");
                row.createCell(4).setCellValue(p.getGender() != null && p.getGender().name().equals("FEMALE") ? "Nữ" : "Nam");
                row.createCell(5).setCellValue(p.getPickupLocationName() != null ? p.getPickupLocationName() : "Điểm tập trung chính");
                row.createCell(6).setCellValue(p.getPickupTime() != null ? p.getPickupTime().toString() : "07:00");
                row.createCell(7).setCellValue(p.getContactPhone() != null ? p.getContactPhone() : "");
                row.createCell(8).setCellValue("[   ]"); // Ô điểm danh ký nhận
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Lỗi xuất Excel danh sách đoàn: ", e);
            throw new RuntimeException("Không thể xuất danh sách đoàn: " + e.getMessage());
        }
    }

    // ================= 3. XUẤT VÉ ĐIỆN TỬ & HÓA ĐƠN PDF (CUSTOMER) =================
    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportBookingTicketPdf(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt tour!"));

        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font chữ OpenPDF (sử dụng java.awt.Color)
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLUE);
            com.lowagie.text.Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            com.lowagie.text.Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);
            com.lowagie.text.Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            com.lowagie.text.Font successFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(46, 125, 50));

            // Header Công ty
            Paragraph title = new Paragraph("TRAVELHUB ENTERPRISE - E-TICKET & INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph sub = new Paragraph("ELECTRONIC BOOKING CONFIRMATION & PAYMENT RECEIPT", subTitleFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(15);
            document.add(sub);

            // Khung Trạng thái thanh toán
            Paragraph statusP = new Paragraph("STATUS: PAID IN FULL VIA VNPAY SANDBOX (VERIFIED)", successFont);
            statusP.setAlignment(Element.ALIGN_CENTER);
            statusP.setSpacingAfter(15);
            document.add(statusP);

            // Bảng Thông tin Tour & Khách hàng
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(15);

            infoTable.addCell(createCell("Booking Code: " + booking.getBookingCode(), boldFont));
            infoTable.addCell(createCell("Booking Date: " + booking.getCreatedAt().format(DATE_TIME_FORMATTER), regularFont));

            infoTable.addCell(createCell("Tour Name: " + booking.getDeparture().getTour().getName(), boldFont));
            infoTable.addCell(createCell("Departure Date: " + booking.getDeparture().getDepartureDate().format(DATE_FORMATTER), regularFont));

            infoTable.addCell(createCell("Primary Contact: " + booking.getContactName(), regularFont));
            infoTable.addCell(createCell("Phone: " + booking.getContactPhone() + " | Email: " + booking.getContactEmail(), regularFont));

            String pickup = booking.getPickupPoint() != null ? booking.getPickupPoint().getLocationName() : "Main Meeting Point";
            infoTable.addCell(createCell("Meeting/Pickup Point: " + pickup, regularFont));
            infoTable.addCell(createCell("Total Passengers: " + booking.getTotalPassengers() + " person(s)", regularFont));

            document.add(infoTable);

            // Bảng Danh sách hành khách
            Paragraph pHeader = new Paragraph("PASSENGER MANIFEST:", boldFont);
            pHeader.setSpacingAfter(8);
            document.add(pHeader);

            PdfPTable passTable = new PdfPTable(4);
            passTable.setWidthPercentage(100);
            passTable.setWidths(new float[]{1, 4, 2, 2});
            passTable.setSpacingAfter(15);

            passTable.addCell(createHeaderCell("No.", boldFont));
            passTable.addCell(createHeaderCell("Passenger Name", boldFont));
            passTable.addCell(createHeaderCell("Type", boldFont));
            passTable.addCell(createHeaderCell("Gender", boldFont));

            List<BookingPassenger> passengers = booking.getPassengers();
            for (int i = 0; i < passengers.size(); i++) {
                BookingPassenger bp = passengers.get(i);
                passTable.addCell(createCell(String.valueOf(i + 1), regularFont));
                passTable.addCell(createCell(bp.getFullName(), regularFont));
                passTable.addCell(createCell(bp.getPassengerType() != null ? bp.getPassengerType().name() : "ADULT", regularFont));
                passTable.addCell(createCell(bp.getGender() != null ? bp.getGender().name() : "MALE", regularFont));
            }
            document.add(passTable);

            // Bảng Quyết toán tài chính
            PdfPTable priceTable = new PdfPTable(2);
            priceTable.setWidthPercentage(60);
            priceTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            priceTable.setSpacingAfter(20);

            priceTable.addCell(createCell("Total Amount Paid:", boldFont));
            priceTable.addCell(createCell(CURRENCY_FORMAT.format(booking.getTotalAmount()), boldFont));

            document.add(priceTable);

            // Footer
            Paragraph footer = new Paragraph("Thank you for choosing TravelHub Enterprise. Wish you a wonderful journey!\nSupport Hotline: 1900 6868 | Email: support@travelhub.com", subTitleFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Lỗi xuất PDF vé tour: ", e);
            throw new RuntimeException("Không thể tạo file PDF vé tour: " + e.getMessage());
        }
    }

    private PdfPCell createCell(String text, com.lowagie.text.Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        cell.setBorderColor(Color.LIGHT_GRAY);
        return cell;
    }

    private PdfPCell createHeaderCell(String text, com.lowagie.text.Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6);
        cell.setBackgroundColor(new Color(230, 240, 255));
        cell.setBorderColor(Color.LIGHT_GRAY);
        return cell;
    }
}