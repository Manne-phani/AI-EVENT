import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Copy, Download, Share2, RefreshCw, Check, AlertCircle, FileText, ArrowLeft, Heart, Award, Receipt, Percent } from 'lucide-react';
import FeedbackSection from './FeedbackSection';

const PairingResult = ({ result, inputs, onRegenerate, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  
  // Interactive billing states
  const [includeBeverages, setIncludeBeverages] = useState(true);
  const [addUpsell, setAddUpsell] = useState(false);

  const {
    generationId,
    eventSummary,
    pastries = [],
    desserts = [],
    snacks = [],
    beveragePairing = [],
    quantitySuggestions,
    whyThesePairingsWork,
    estimatedCostCategory,
    extraRecommendation
  } = result;

  // ==========================================
  // LOW-COST INR BILLING CALCULATOR CORE LOGIC
  // ==========================================
  
  // Unit prices in INR (Indian Rupees) - Low Cost Bakery Standards
  const getUnitPrice = (name) => {
    const n = name.toLowerCase();
    if (n.includes('champagne') || n.includes('wine') || n.includes('martini')) return 80; // Non-alcoholic sparkling/mocktail equivalents
    if (n.includes('punch') || n.includes('lemonade')) return 30;
    if (n.includes('milkshake') || n.includes('lassi')) return 40;
    if (n.includes('tea') || n.includes('water') || n.includes('cider') || n.includes('coffee') || n.includes('chai')) return 15;
    if (n.includes('macaron')) return 20;
    if (n.includes('eclair') || n.includes('croissant') || n.includes('danish') || n.includes('scone') || n.includes('bun') || n.includes('turnover') || n.includes('donut')) return 25;
    if (n.includes('mousse') || n.includes('brûlée') || n.includes('panna cotta') || n.includes('pie') || n.includes('cheesecake') || n.includes('fudge') || n.includes('pop') || n.includes('cupcake') || n.includes('cake')) return 30;
    if (n.includes('charcuterie') || n.includes('board') || n.includes('platter')) return 150;
    if (n.includes('flatbread') || n.includes('quiche') || n.includes('canapé') || n.includes('slider') || n.includes('samosa')) return 25;
    if (n.includes('pretzel') || n.includes('almond') || n.includes('cashew') || n.includes('skewer') || n.includes('popcorn')) return 20;
    return 20;
  };

  const parseQty = (qtyStr) => {
    if (!qtyStr) return 0;
    const match = qtyStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  // Main cake centerpiece calculations in INR - Low Cost
  const guestCountNum = parseInt(inputs.guestCount, 10) || 50;
  const cakeRate = estimatedCostCategory === 'Luxury' ? 80 : estimatedCostCategory === 'Premium' ? 50 : 30;
  const cakeCost = guestCountNum * cakeRate;

  // Category totals
  const pastriesCost = pastries.reduce((sum, p) => sum + (parseQty(p.quantity) * getUnitPrice(p.name)), 0);
  const dessertsCost = desserts.reduce((sum, d) => sum + (parseQty(d.quantity) * getUnitPrice(d.name)), 0);
  const snacksCost = snacks.reduce((sum, s) => sum + (parseQty(s.quantity) * getUnitPrice(s.name)), 0);
  const beveragesCost = includeBeverages 
    ? beveragePairing.reduce((sum, b) => sum + (parseQty(b.quantity) * getUnitPrice(b.name)), 0)
    : 0;

  // Upsell calculations in INR - Low Cost
  const getUpsellPrice = (rec) => {
    const r = rec.toLowerCase();
    if (r.includes('macaron tower') || r.includes('centerpiece')) return 600;
    if (r.includes('cookie pack') || r.includes('sugar cookie')) return 100;
    if (r.includes('corporate box') || r.includes('corporate pastry')) return 250;
    if (r.includes('gift box') || r.includes('hamper')) return 200;
    if (r.includes('fondue') || r.includes('chocolate fountain')) return 400;
    if (r.includes('welcome pack') || r.includes('sourdough')) return 120;
    return 120;
  };
  const upsellCost = addUpsell ? getUpsellPrice(extraRecommendation) : 0;

  // Subtotals
  const subtotal = cakeCost + pastriesCost + dessertsCost + snacksCost + beveragesCost + upsellCost;
  const tax = subtotal * 0.08;
  const setupFee = subtotal * 0.10;
  const totalAmount = subtotal + tax + setupFee;

  // ==========================================
  // EXPORT UTILITIES
  // ==========================================
  
  // 1. Copy to Clipboard
  const handleCopy = () => {
    const text = formatMenuAsText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. Share Link
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/${generationId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Cakes & Crunches AI Menu Pairing',
        text: eventSummary,
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Text formatter for copy/download
  const formatMenuAsText = () => {
    let text = `========================================\n`;
    text += `   CAKES & CRUNCHES CATERING SUGGESTIONS\n`;
    text += `========================================\n\n`;
    text += `Event Details: ${eventSummary}\n`;
    text += `Main Cake: ${inputs.mainCakeType} Cake\n`;
    text += `Guest Count: ${inputs.guestCount} guests\n`;
    text += `Budget Level: ${estimatedCostCategory}\n\n`;
    
    text += `--- RECOMMENDED PAIRINGS ---\n\n`;

    if (pastries.length > 0) {
      text += `[Pastries]\n`;
      pastries.forEach(p => text += `- ${p.name} (${p.quantity}): ${p.description}\n`);
      text += `\n`;
    }

    if (desserts.length > 0) {
      text += `[Desserts]\n`;
      desserts.forEach(d => text += `- ${d.name} (${d.quantity}): ${d.description}\n`);
      text += `\n`;
    }

    if (snacks.length > 0) {
      text += `[Snacks]\n`;
      snacks.forEach(s => text += `- ${s.name} (${s.quantity}): ${s.description}\n`);
      text += `\n`;
    }

    if (beveragePairing.length > 0 && includeBeverages) {
      text += `[Beverages]\n`;
      beveragePairing.forEach(b => text += `- ${b.name} (${b.quantity}): ${b.description}\n`);
      text += `\n`;
    }

    text += `--- ESTIMATED CATERING QUOTATION ---\n`;
    text += `Main Centerpiece Cake: Rs. ${cakeCost.toFixed(2)}\n`;
    text += `Pastries Assortment: Rs. ${pastriesCost.toFixed(2)}\n`;
    text += `Desserts Assortment: Rs. ${dessertsCost.toFixed(2)}\n`;
    text += `Snacks Assortment: Rs. ${snacksCost.toFixed(2)}\n`;
    if (includeBeverages) {
      text += `Beverages Assortment: Rs. ${beveragesCost.toFixed(2)}\n`;
    }
    if (addUpsell) {
      text += `Chef's Upsell Addition: Rs. ${upsellCost.toFixed(2)}\n`;
    }
    text += `--------------------------------------\n`;
    text += `Subtotal: Rs. ${subtotal.toFixed(2)}\n`;
    text += `Sales Tax (8%): Rs. ${tax.toFixed(2)}\n`;
    text += `Setup & Delivery Fee (10%): Rs. ${setupFee.toFixed(2)}\n`;
    text += `TOTAL ESTIMATED BILL AMOUNT: Rs. ${totalAmount.toFixed(2)}\n\n`;

    text += `--- CATERING GUIDELINES ---\n`;
    text += `Quantity Suggestions: ${quantitySuggestions}\n\n`;
    text += `Why These Work: ${whyThesePairingsWork}\n\n`;
    text += `Chef's Upsell Recommendation: ${extraRecommendation}\n\n`;
    text += `Order online at Cakes & Crunches. Thank you!`;
    return text;
  };

  // 3. Download as Plain TXT
  const handleDownloadTxt = () => {
    const text = formatMenuAsText();
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Cakes_Crunches_Menu_${inputs.eventType || 'Catering'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 4. Download as PDF using jsPDF
  const handleDownloadPdf = () => {
    setPdfGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = [61, 39, 29]; // Chocolate
      const secondaryColor = [229, 169, 158]; // Rose
      const textColor = [110, 77, 60]; // Chocolate Light

      // Logo/Header
      doc.setFillColor(255, 253, 249); // Cream background
      doc.rect(0, 0, 210, 297, 'F');

      // Title Banner
      doc.setFillColor(245, 237, 228); // Beige background block
      doc.rect(10, 10, 190, 35, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CAKES & CRUNCHES BAKERY", 15, 23);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text("AI-Powered Event Dessert Menu Pairing Planner", 15, 29);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 145, 29);

      // Section: Summary
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CATERING SPECIFICATIONS", 15, 55);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      const summaryLines = doc.splitTextToSize(eventSummary, 180);
      doc.text(summaryLines, 15, 61);

      let currentY = 61 + (summaryLines.length * 4.5) + 5;

      // Table helper
      const drawCategory = (title, items) => {
        if (!items || items.length === 0) return;
        
        if (currentY > 240) {
          doc.addPage();
          doc.setFillColor(255, 253, 249);
          doc.rect(0, 0, 210, 297, 'F');
          currentY = 20;
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(title, 15, currentY);
        doc.setLineWidth(0.3);
        doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.line(15, currentY + 1.5, 195, currentY + 1.5);
        
        currentY += 6;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);

        items.forEach(item => {
          doc.setFont('Helvetica', 'bold');
          doc.text(`${item.name} (${item.quantity})`, 18, currentY);
          
          doc.setFont('Helvetica', 'normal');
          const descLines = doc.splitTextToSize(item.description, 175);
          doc.text(descLines, 20, currentY + 4);
          
          currentY += 4 + (descLines.length * 4.2) + 2;
        });

        currentY += 4;
      };

      // Draw pairings
      drawCategory("Recommended Pastries", pastries);
      drawCategory("Recommended Desserts", desserts);
      drawCategory("Recommended Savory Snacks", snacks);
      if (includeBeverages) {
        drawCategory("Recommended Beverage Pairings", beveragePairing);
      }

      // Section: Billing Invoice table
      if (currentY > 210) {
        doc.addPage();
        doc.setFillColor(255, 253, 249);
        doc.rect(0, 0, 210, 297, 'F');
        currentY = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("ESTIMATED CATERING QUOTATION", 15, currentY);
      doc.line(15, currentY + 1.5, 195, currentY + 1.5);
      currentY += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      const drawBillRow = (label, amt) => {
        doc.text(label, 20, currentY);
        doc.text(`Rs. ${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 180, currentY, { align: 'right' });
        currentY += 5;
      };

      drawBillRow(`Main Centerpiece Cake (${inputs.mainCakeType} Cake - ${guestCountNum} Guests)`, cakeCost);
      drawBillRow("Recommended Pastries Assortment", pastriesCost);
      drawBillRow("Delectable Desserts Selection", dessertsCost);
      drawBillRow("Savory & Sweet Snacks Selection", snacksCost);
      if (includeBeverages) {
        drawBillRow("Beverages Assortment Selection", beveragesCost);
      }
      if (addUpsell) {
        drawBillRow(`Chef's Addition: ${extraRecommendation.split('.')[0]}`, upsellCost);
      }

      doc.setLineWidth(0.2);
      doc.setDrawColor(200, 200, 200);
      doc.line(15, currentY, 195, currentY);
      currentY += 5;

      doc.setFont('Helvetica', 'bold');
      drawBillRow("Subtotal", subtotal);
      doc.setFont('Helvetica', 'normal');
      drawBillRow("Sales Tax (8%)", tax);
      drawBillRow("Catering Setup & Delivery (10%)", setupFee);

      doc.line(15, currentY, 195, currentY);
      currentY += 5;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10.5);
      drawBillRow("TOTAL ESTIMATED BILL AMOUNT", totalAmount);
      currentY += 8;

      // Section: Quantity Guidelines & rationales
      if (currentY > 230) {
        doc.addPage();
        doc.setFillColor(255, 253, 249);
        doc.rect(0, 0, 210, 297, 'F');
        currentY = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("QUANTITY & PAIRING RATIONALE", 15, currentY);
      doc.line(15, currentY + 1.5, 195, currentY + 1.5);
      currentY += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      const qtyLines = doc.splitTextToSize(quantitySuggestions, 180);
      doc.text(qtyLines, 15, currentY);
      currentY += (qtyLines.length * 4.2) + 3;

      const whyLines = doc.splitTextToSize(whyThesePairingsWork, 180);
      doc.text(whyLines, 15, currentY);
      currentY += (whyLines.length * 4.2) + 8;

      // Upsell Box
      doc.setFillColor(249, 224, 217); 
      doc.rect(15, currentY, 180, 22, 'F');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("CHEF'S RECOMMENDATION TO INCREASE EVENT VALUE:", 20, currentY + 6);
      
      doc.setFont('Helvetica', 'normal');
      const upsellLines = doc.splitTextToSize(extraRecommendation, 170);
      doc.text(upsellLines, 20, currentY + 11);

      // Save PDF
      doc.save(`Cakes_Crunches_Menu_${inputs.eventType || 'Catering'}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  // Render cards helper
  const renderItemCards = (title, items, bgColor, imageUrl) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="bg-white border border-brand-pink/30 rounded-3xl overflow-hidden shadow-soft hover:shadow-premium transition-shadow duration-300 flex flex-col justify-between">
        <div>
          {/* Cover Category Image */}
          {imageUrl && (
            <div className="h-36 w-full overflow-hidden relative border-b border-brand-pink/20">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-chocolate/40 to-transparent"></div>
            </div>
          )}
          
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-2xl ${bgColor} text-brand-chocolate`}>
                <Award className="h-5 w-5" />
              </div>
              <h4 className="font-serif text-lg font-bold text-brand-chocolate">{title}</h4>
            </div>
            
            <div className="space-y-4 pt-2">
              {items.map((item, index) => (
                <div key={index} className="space-y-1 group">
                  <div className="flex justify-between items-baseline">
                    <h5 className="font-sans text-sm font-bold text-brand-chocolate group-hover:text-brand-rose transition-colors">
                      {item.name}
                    </h5>
                    <span className="text-[11px] font-bold text-brand-chocolate bg-brand-beige px-2.5 py-0.5 rounded-full whitespace-nowrap ml-2">
                      {item.quantity}
                    </span>
                  </div>
                  <p className="text-xs text-brand-chocolate-light leading-relaxed">
                    {item.description}
                  </p>
                  {index < items.length - 1 && (
                    <div className="border-t border-dashed border-brand-beige pt-3 mt-3"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Action Header bar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 border border-brand-pink/50 hover:bg-brand-pink/20 rounded-xl text-xs font-bold text-brand-chocolate-light hover:text-brand-chocolate transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Form
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center px-4 py-2 bg-brand-cream border border-brand-pink/50 hover:border-brand-rose rounded-xl text-xs font-bold text-brand-chocolate-light hover:text-brand-chocolate shadow-soft transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center px-4 py-2 bg-brand-cream border border-brand-pink/50 hover:border-brand-rose rounded-xl text-xs font-bold text-brand-chocolate-light hover:text-brand-chocolate shadow-soft transition-colors"
          >
            {shared ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5 mr-1.5" />}
            {shared ? 'Link Copied!' : 'Share'}
          </button>

          {/* TXT */}
          <button
            onClick={handleDownloadTxt}
            className="flex items-center px-4 py-2 bg-brand-cream border border-brand-pink/50 hover:border-brand-rose rounded-xl text-xs font-bold text-brand-chocolate-light hover:text-brand-chocolate shadow-soft transition-colors"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            TXT
          </button>

          {/* PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfGenerating}
            className="flex items-center px-4 py-2 bg-brand-pink text-brand-chocolate hover:bg-brand-rose rounded-xl text-xs font-bold shadow-soft transition-colors disabled:opacity-50"
          >
            {pdfGenerating ? (
              <div className="h-3.5 w-3.5 border-2 border-brand-chocolate border-t-transparent rounded-full animate-spin mr-1.5"></div>
            ) : (
              <Download className="h-3.5 w-3.5 mr-1.5" />
            )}
            PDF
          </button>

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            className="flex items-center px-4 py-2 bg-brand-chocolate hover:bg-brand-chocolate-light text-brand-cream rounded-xl text-xs font-bold transition-all shadow-premium"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Regenerate
          </button>
        </div>
      </div>

      {/* Main Results Display Card */}
      <div className="space-y-6">
        
        {/* 1. Header Spec Box */}
        <div className="bg-brand-beige border border-brand-pink/30 rounded-3xl p-6 md:p-8 shadow-soft relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-pink/30 rounded-bl-full flex items-center justify-center pl-6 pb-6">
            <Heart className="h-6 w-6 text-brand-rose" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-rose bg-white px-2.5 py-0.5 rounded-full border border-brand-pink/20 shadow-soft">
                {inputs.eventType}
              </span>
              <span className="text-xs uppercase tracking-widest font-extrabold text-brand-chocolate-light bg-brand-cream px-2.5 py-0.5 rounded-full border border-brand-pink/20">
                {estimatedCostCategory} Budget
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-brand-chocolate max-w-[85%] leading-tight">
              Pairing Menu Recommendations
            </h2>
            <p className="text-sm font-medium text-brand-chocolate-light leading-relaxed max-w-2xl pt-1">
              {eventSummary}
            </p>
          </div>
        </div>

        {/* 2. Grid for Pairing Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderItemCards("Complementary Pastries", pastries, "bg-brand-pink/40", "/images/category_pastry.png")}
          {renderItemCards("Delectable Desserts", desserts, "bg-orange-50", "/images/category_dessert.png")}
          {renderItemCards("Savory & Sweet Snacks", snacks, "bg-yellow-50", "/images/category_snack.png")}
          {includeBeverages && renderItemCards("Beverage Pairings", beveragePairing, "bg-teal-50", "/images/category_beverage.png")}
        </div>

        {/* ==========================================
            BILLING INVOICE CALCULATION ESTIMATE (INR)
            ========================================== */}
        <div className="bg-white border border-brand-pink/40 rounded-[32px] p-6 md:p-8 shadow-premium space-y-6">
          <div className="flex items-center space-x-3 border-b border-brand-pink/20 pb-4">
            <div className="p-2.5 bg-brand-pink/55 text-brand-chocolate rounded-xl">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-brand-chocolate">Catering Billing Quotation Estimate</h4>
              <p className="text-[10px] text-brand-chocolate-light uppercase tracking-wider font-semibold">Cakes & Crunches Invoice Breakdown</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Invoice Line items */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-baseline text-brand-chocolate">
                <span className="font-medium">1. Main Centerpiece Cake ({inputs.mainCakeType} - {guestCountNum} guests)</span>
                <span className="font-bold whitespace-nowrap">₹{cakeCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-baseline text-brand-chocolate">
                <span className="font-medium">2. Recommended Pastries ({pastries.reduce((sum, p) => sum + parseQty(p.quantity), 0)} pcs)</span>
                <span className="font-bold whitespace-nowrap">₹{pastriesCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-baseline text-brand-chocolate">
                <span className="font-medium">3. Delectable Desserts ({desserts.reduce((sum, d) => sum + parseQty(d.quantity), 0)} pcs)</span>
                <span className="font-bold whitespace-nowrap">₹{dessertsCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-baseline text-brand-chocolate">
                <span className="font-medium">4. Savory & Sweet Snacks ({snacks.reduce((sum, s) => sum + parseQty(s.quantity), 0)} pcs)</span>
                <span className="font-bold whitespace-nowrap">₹{snacksCost.toLocaleString('en-IN')}</span>
              </div>
              
              {/* Beverage line with interactive checkbox */}
              <div className="flex justify-between items-center text-brand-chocolate bg-brand-cream/40 p-2.5 rounded-xl border border-brand-pink/20">
                <label className="flex items-center space-x-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeBeverages}
                    onChange={(e) => setIncludeBeverages(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-brand-pink text-brand-rose focus:ring-brand-rose"
                  />
                  <span>5. Include Beverage Pairings ({beveragePairing.reduce((sum, b) => sum + parseQty(b.quantity), 0)} glasses)</span>
                </label>
                <span className={`font-bold whitespace-nowrap ${includeBeverages ? '' : 'line-through text-brand-chocolate-light/40'}`}>
                  ₹{beveragesCost.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Upsell line with interactive checkbox */}
              <div className="flex justify-between items-center text-brand-chocolate bg-brand-pink/20 p-2.5 rounded-xl border border-brand-rose/25">
                <label className="flex items-center space-x-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addUpsell}
                    onChange={(e) => setAddUpsell(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-brand-rose text-brand-chocolate focus:ring-brand-rose"
                  />
                  <span className="flex items-center">
                    🌟 Add Chef's Gourmet Addition (₹{getUpsellPrice(extraRecommendation).toLocaleString('en-IN')})
                  </span>
                </label>
                <span className={`font-bold whitespace-nowrap ${addUpsell ? '' : 'text-brand-chocolate-light/40'}`}>
                  {addUpsell ? `₹${upsellCost.toLocaleString('en-IN')}` : '₹0'}
                </span>
              </div>
            </div>

            {/* Calculations lines */}
            <div className="border-t border-dashed border-brand-pink/40 pt-4 space-y-2 text-xs font-semibold text-brand-chocolate-light">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-brand-chocolate">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Percent className="h-3 w-3 mr-1" />
                  Estimated GST / Sales Tax (8.0%)
                </span>
                <span className="font-bold text-brand-chocolate">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery & Setup Service Fee (10.0%)</span>
                <span className="font-bold text-brand-chocolate">₹{setupFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {/* Grand Total */}
              <div className="border-t border-brand-pink/35 pt-4 flex justify-between items-baseline">
                <span className="font-serif text-base font-black text-brand-chocolate uppercase">Estimated Catering Total</span>
                <span className="font-serif text-2xl font-black text-brand-chocolate font-serif bg-brand-beige px-4 py-1.5 rounded-2xl border border-brand-pink/40 shadow-soft">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Rationales Card */}
        <div className="bg-white border border-brand-pink/40 rounded-3xl p-6 md:p-8 shadow-premium space-y-6">
          <div className="space-y-2">
            <h4 className="font-serif text-lg font-bold text-brand-chocolate flex items-center">
              <AlertCircle className="h-5 w-5 text-brand-rose mr-2" />
              Serving & Quantity Suggestions
            </h4>
            <p className="text-sm text-brand-chocolate-light leading-relaxed">
              {quantitySuggestions}
            </p>
          </div>

          <div className="border-t border-brand-pink/30 pt-6 space-y-2">
            <h4 className="font-serif text-lg font-bold text-brand-chocolate flex items-center">
              <Award className="h-5 w-5 text-brand-rose mr-2" />
              Why These Pairings Work
            </h4>
            <p className="text-sm text-brand-chocolate-light leading-relaxed">
              {whyThesePairingsWork}
            </p>
          </div>
        </div>

        {/* 4. Upsell Promotions Banner */}
        <div className="bg-gradient-to-r from-brand-chocolate to-brand-chocolate-light text-brand-cream border border-brand-chocolate rounded-3xl p-6 md:p-8 shadow-premium flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full transform translate-x-12 translate-y-[-12px] pointer-events-none"></div>
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-brand-rose bg-white/10 px-2.5 py-0.5 rounded-full inline-block">
              Exclusive Catering Addition
            </span>
            <h4 className="font-serif text-xl font-bold">Chef's Gourmet Upsell Suggestion</h4>
            <p className="text-xs text-brand-cream/80 leading-relaxed pt-0.5">
              {extraRecommendation}
            </p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => {
                setAddUpsell(true);
                alert("Chef's gourmet addition has been added to your quotation estimate above!");
              }}
              className="w-full md:w-auto bg-brand-pink hover:bg-brand-rose text-brand-chocolate px-6 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-soft active:scale-[0.98] whitespace-nowrap"
            >
              Add to Catering Order
            </button>
          </div>
        </div>

      </div>

      {/* 5. Feedback System Section */}
      <div className="border-t border-brand-pink/30 pt-8">
        <FeedbackSection generationId={generationId} />
      </div>
    </div>
  );
};

export default PairingResult;
