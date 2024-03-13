// console.-log("argv", argv);
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
    // console.log("inputMatches", inputMatches);
    const input = inputMatches[0].replace(/\.ps/g, "").trim(); // my_ps
    const outputMatches = argv[1]?.match(outputRegex);
    // console.log("outputMatches", outputMatches);
    let output;
    if (outputMatches === undefined) {
        output = "";
    }
    else {
        output = outputMatches[0].replace(/\.svg/g, "").trim(); // new_svg
    }
    //const folderPsFile = path.dirname(inputMatches[0]);
    let inputName = "";
    let outputName = "";
    //if (argv.length === 1 && argv[0].match(/^find-all$/)) {
    //    if (process.platform === "win32") {
    //        const getItem = child_process.spawn("Get-ChildItem", ["-Recurse", "-Filter", "*.ps"]);
    //        const select = child_process.spawn("Select-Object", ["-Property", "FullName"]);
    //        getItem.stdout.pipe(select.stdin);
    //        select.stdout.on("data", (data) => {
    //            const files = data.toString().trim().split("\r\n");
    //            console.log(files);
    //        });
    //    }
    //    if (process.platform === "linux") {
    //        const find = child_process.spawnSync("find", ["-name", "*.ps"]).stdout.toString().trim().split("\n");
    //        console.log(find);
    //    }
    //    process.exit(1);
    //}
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
    // console.log("(1)", inputName);
    // console.log("(2)", outputName);
    return { inputName, outputName };
}
export default cli