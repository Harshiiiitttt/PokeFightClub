const tau = Math.PI * 2;
export const megaColors = {
  3:'#ff9fc4',6:'#59dfff',9:'#84ddff',94:'#d59aff',150:'#e39eff',
  254:'#84f596',257:'#ff8952',260:'#5ec8ff',282:'#ffb8e8',373:'#ff6b7e',
  376:'#9ce6ff',382:'#4db8ff',383:'#ff7b39',384:'#ffdb70',445:'#a28dff',
  448:'#93beff',800:'#ffe97d'
};

// The form changes at the narrowest point of the orbit.
export function drawEvolution(c, species, progress) {
  const reveal = Math.max(0, (progress - .6) / .4);
  const radius = progress < .6 ? 85 - progress * 108 : 20 + reveal * 85;
  c.strokeStyle = c.fillStyle = megaColors[species] || '#ffe599';
  c.globalAlpha = Math.min(1, progress * 8, (1 - progress) * 6);
  c.lineWidth = 3;
  c.shadowColor = c.strokeStyle;
  c.shadowBlur = 8;
  const count = species === 9 || species === 382 ? 2 : species === 448 || species === 376 ? 6 : 10;
  for (let i = 0; i < count; i++) {
    const angle = i * tau / count + progress * 4;
    c.save();
    c.rotate(angle);
    c.translate(radius, 0);
    c.beginPath();
    switch (species) {
      case 3:
      case 254:
      case 282:
        c.ellipse(0, 0, 14, 5, progress * 3, 0, tau);
        break;
      case 6:
      case 257:
      case 383:
        c.moveTo(-8, 0); c.quadraticCurveTo(4, -18, 22, -15);
        c.quadraticCurveTo(10, -8, 12, 2); c.closePath();
        break;
      case 9:
      case 260:
      case 382:
        for (let j = 0; j < 45; j++) {
          const a = j / 6 + progress * 9;
          c.lineTo(Math.cos(a) * j * .55, Math.sin(a) * j * .55);
        }
        break;
      case 94:
      case 150:
      case 445:
        c.arc(0, 0, 13, .35, 5.4);
        c.quadraticCurveTo(-5, 0, 12, 4);
        break;
      case 448:
      case 376:
      case 800:
        c.moveTo(-14, 0); c.lineTo(0, -5); c.lineTo(20, 0);
        c.lineTo(0, 5); c.closePath();
        break;
      default:
        c.arc(-radius, 0, radius + i, -.28, .18);
        break;
    }
    if ([9, 260, 382, 384, 373].includes(species)) c.stroke();
    else c.fill();
    c.restore();
  }
}
