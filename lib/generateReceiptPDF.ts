import { jsPDF } from 'jspdf';
import { type Order } from '@/app/orders/page';

export function generateReceiptPDF(order: Order) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  // A5 dimensions: 148 x 210 mm
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Helper to center text
  const centerText = (text: string, y: number) => {
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  centerText('Local Taste Hub', yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  centerText('Rekomendasi Kuliner Lokal Terbaik', yPos);

  // Line
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Order Info
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('INFORMASI PESANAN', margin, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Order : #${order.id.slice(-8).toUpperCase()}`, margin, yPos);
  
  yPos += 5;
  const date = new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  doc.text(`Tanggal   : ${date}`, margin, yPos);
  
  yPos += 5;
  doc.text(`Metode    : ${order.paymentMethod === 'cash' ? 'Cash/Tunai' : 'Transfer Bank'}`, margin, yPos);

  // Line
  yPos += 8;
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Items
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('DAFTAR MENU', margin, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  
  order.items.forEach((item) => {
    // Check page break
    if (yPos > 180) {
      doc.addPage();
      yPos = 20;
    }
    
    // Item name
    doc.setFont('helvetica', 'bold');
    doc.text(item.menuName, margin, yPos);
    
    // Qty x Price
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const sub = `Rp ${(item.price * item.qty).toLocaleString('id-ID')}`;
    doc.text(`${item.qty}x @ Rp ${item.price.toLocaleString('id-ID')}`, margin, yPos);
    
    // Align subtotal to right
    const subWidth = doc.getTextWidth(sub);
    doc.text(sub, pageWidth - margin - subWidth, yPos);
    
    yPos += 7;
  });

  // Line
  yPos += 3;
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Total
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL', margin, yPos);
  const totalStr = `Rp ${order.totalPrice.toLocaleString('id-ID')}`;
  const totalWidth = doc.getTextWidth(totalStr);
  doc.text(totalStr, pageWidth - margin - totalWidth, yPos);

  // Footer
  yPos += 30;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  centerText('Terima kasih telah menggunakan Local Taste Hub', yPos);
  
  yPos += 5;
  const printDate = new Date().toLocaleDateString('id-ID');
  centerText(`Dicetak pada: ${printDate}`, yPos);

  // Save PDF
  doc.save(`bukti-${order.id}.pdf`);
}
