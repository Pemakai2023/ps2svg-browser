function cli(argv) {
    if (argv.length < 1 || argv.length > 2) {
        console.log(`
          Usage: (.ps | .svg)? is optional
          ps2svg find-all                   => ["path/to/my_ps.ps"]
          ps2svg path/to/my_ps(.ps)?        => my_ps.svg
          ps2svg my_ps(.ps)?                => my_ps.svg
          ps2svg my_ps(.ps)? new_svg(.svg)? => new_svg.svg
        `);
    }
    const inputRegex = /[.:\w\d\\/]+(\.ps)?/g;
    const outputRegex = /\w+(\.svg)?$/g;
    const inputMatches = argv[0].match(inputRegex);
    const input = inputMatches[0].replace(/\.ps/g, "").trim(); // my_ps
    const outputMatches = argv[1]?.match(outputRegex);
    let output;
    if (outputMatches === undefined) {
        output = "";
    }
    else {
        output = outputMatches[0].replace(/\.svg/g, "").trim(); // new_svg
    }
    let inputName = "";
    let outputName = "";
    if (argv.length === 1) {
        inputName = input;
    }
    if (argv.length === 2) {
        inputName = input;
        outputName = output;
    }
    if (outputName === "") {
        outputName = inputName;
    }
    return { inputName, outputName };
}
export default cli
