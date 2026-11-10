"""Create one plain-paper Avery 5168 alignment check at the studio's exact geometry."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / 'output/pdf/PRPD_Avery_5168_Alignment_Check.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
c = canvas.Canvas(str(OUTPUT), pagesize=letter)
c.setTitle('PRPD Avery 5168 - Plain-Paper Alignment Check')
c.setAuthor('PRPD')
c.setFont('Helvetica-Bold', 10)
c.drawCentredString(306, 772, 'PRPD AVERY 5168 ALIGNMENT CHECK - TEST ONLY')
c.setFont('Helvetica', 7)
c.drawCentredString(306, 761, 'Letter 8.5 x 11 in | Portrait | Actual size / 100% | One copy | Plain paper first')

slots = [(36, 396), (324, 396), (36, 36), (324, 36)]
titles = ['1  TOP LEFT - SCALE CHECK', '2  TOP RIGHT - PRINT SETTINGS',
          '3  BOTTOM LEFT - ALIGNMENT', '4  BOTTOM RIGHT - RECORD RESULT']
for index, (x, y) in enumerate(slots):
    c.setStrokeColor(HexColor('#111111'))
    c.setLineWidth(0.6)
    c.rect(x, y, 252, 360)
    # Same envelope as translate(3.43in, .1in) rotate(90deg) scale(.96).
    c.setDash(3, 3)
    c.setStrokeColor(HexColor('#777777'))
    c.rect(x + 5.04, y + 7.2, 241.92, 345.6)
    c.setDash()
    c.setStrokeColor(HexColor('#111111'))
    c.setLineWidth(0.5)
    marks = [(x + 12, y + 12), (x + 240, y + 348)]
    for px, py in marks:
        c.line(px-4, py, px+4, py)
        c.line(px, py-4, px, py+4)
    c.setFillColor(HexColor('#111111'))
    c.setFont('Helvetica-Bold', 10)
    c.drawString(x + 18, y + 326, titles[index])
    c.setFont('Helvetica', 8)
    c.drawString(x + 18, y + 309, 'Solid outline: 3.5 x 5 in label boundary')
    c.drawString(x + 18, y + 296, 'Dashed outline: current studio artwork inset')

def lines(slot, content, start=265, leading=15):
    x, y = slots[slot]
    c.setFont('Helvetica', 9)
    for row, text in enumerate(content):
        c.drawString(x + 18, y + start - row*leading, text)

lines(0, ['Measure this square with a ruler.', 'Both sides must be 1 inch (25.4 mm).'])
x, y = slots[0]
c.setLineWidth(1)
c.rect(x+90, y+133, 72, 72)
c.setFont('Helvetica-Bold', 9)
c.drawCentredString(x+126, y+164, '1 inch')
lines(0, ['Measured width: __________ mm', 'Measured height: _________ mm',
          'If either is wrong, correct scaling first.', 'Do not compensate by moving the artwork.'], start=103)
lines(1, ['Paper: US Letter (8.5 x 11 inches)', 'Orientation: Portrait',
          'Scale: Actual size or 100%', 'Copies: 1; one-sided printing',
          'Fit / shrink / borderless expansion: off', 'Browser headers and footers: off',
          'Print this test on plain paper.', 'Hold it behind one unused label sheet.',
          'Check all four solid outlines against cuts.', 'Then use the paper type recommended',
          'for your printer and label stock.'])
lines(2, ['Check all four slots, not just the first.', 'Same offset everywhere: record X and Y.',
          'Growing offset: recheck scale and paper size.', 'Tilt or changing offset: check feed guides.',
          'Compare two plain-paper prints if needed.', '',
          'Top-left offset:    X _____  Y _____ mm',
          'Top-right offset:   X _____  Y _____ mm',
          'Bottom-left offset: X _____  Y _____ mm',
          'Bottom-right offset:X _____  Y _____ mm', '',
          'X positive = right. Y positive = down.'])
lines(3, ['Date / time: ________________________', 'Printer model: ______________________',
          'App / PDF viewer: ___________________', 'Paper size / scale: __________________',
          'Tray / paper type: ___________________', 'Test 1: pass / fail    Test 2: pass / fail',
          'Result / adjustment: _________________', '__________________________________', '',
          'This sheet does not verify meal counts,', 'nutrition, net weights or label approval.'])
x, y = slots[3]
c.setFont('Helvetica', 6)
c.drawString(x+18, y+42, 'Template: avery.com/templates/5168')
c.drawString(x+18, y+31, 'Guidance: avery.com/help/article/make-a-printer-adjustment')
c.setFont('Helvetica', 7)
c.drawCentredString(306, 20, 'Plain-paper calibration only. Do not place these test labels on food. Page 1 of 1.')
c.showPage()
c.save()
print(OUTPUT)
