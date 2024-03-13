export function ryb2rgb([R, Y, B]) {
    const REGEX = /\d?\.\d+/g;
    const WHITE_RGB = 255;
    const WHITE_RYB = 1.0;
    const R_ryb = Number(R.toString().match(REGEX));
    const Y_ryb = Number(Y.toString().match(REGEX));
    const B_ryb = Number(B.toString().match(REGEX));
    let R_rgb;
    let G_rgb;
    let B_rgb;
    if (R_ryb > WHITE_RYB) {
        R_rgb = WHITE_RGB;
        G_rgb = Math.floor(B_ryb + Y_ryb * WHITE_RGB);
        B_rgb = Math.floor(Y_ryb + B_ryb * WHITE_RGB);
        return [R_rgb, G_rgb, B_rgb];
    }
    if (Y_ryb > WHITE_RYB) {
        R_rgb = Math.floor(R_ryb * WHITE_RGB);
        G_rgb = WHITE_RGB;
        B_rgb = Math.floor(Y_ryb + B_ryb * WHITE_RGB);
        return [R_rgb, G_rgb, B_rgb];
    }
    if (B_ryb > WHITE_RYB) {
        R_rgb = Math.floor(R_ryb * WHITE_RGB);
        G_rgb = Math.floor(B_ryb + Y_ryb * WHITE_RGB);
        B_rgb = WHITE_RGB;
        return [R_rgb, G_rgb, B_rgb];
    }
    R_rgb = Math.floor(R_ryb * WHITE_RGB);
    G_rgb = Math.floor(B_ryb + Y_ryb * WHITE_RGB);
    B_rgb = Math.floor(Y_ryb + B_ryb * WHITE_RGB);
    return [R_rgb, G_rgb, B_rgb];
}
