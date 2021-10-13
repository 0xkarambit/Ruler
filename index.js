#!/usr/bin/env node
import axios from "axios"
import * as cheerio from "cheerio"
import {ArgumentParser} from "argparse"

const log = console.log;

// const strings
const ERROR_STR = `Request got redirected to main listings page which most likely means that the
problem which you were looking for [%d] doesnt exist`

// parsing arguments
const parser = new ArgumentParser({
    description: 'Ruler [rule] projecteuler.net problems automator !',
    add_help: true,
})

// https://github.com/nodeca/argparse/blob/master/doc/migrate_v1_to_v2.md
// >> help(argparse) in bpython
parser.add_argument('-v', '--version', { action: 'version', version:"version1.2.3" });
parser.add_argument('-m', '--minimal', { help: 'specify if minimal page should be scraped [doesnt include the title]',
    action: "store_true",
    default: false
 });
parser.add_argument("problem_number", {help : "the problem to fetch [number]", metavar: "P", nargs: 1, type:"int"})
parser.add_argument("-O", "--ouput", {
    help :"file to write the problem info to",
    metavar: "OUT_FILE_PATH",
    dest: "OUT_FILE_PATH"
})
/*
parser.add_argument('-p', '--problem', {
    help: 'the problem to fetch',
    type: 'str',
    metavar:"p_no", // WHAT appears in place fo --problem in debug/help msgs 
    required: true, 
    // dest: 'n', // the variable by which it will be available after parsing throught parser.$dest .
    default: 0, // the default value in case value is not specified in argumnets
    nargs: 1,  // n of args, ["+" | int]
    option_strings: "what is trih ?" // WHAT
    // action, choices, const, option_strings,

    // https://stackoverflow.com/questions/19124304/what-does-metavar-and-action-mean-in-argparse-in-python

    // https://stackoverflow.com/a/43660050/9596267
    // Metavar: It provides a different name for optional argument in help messages.
    // Provide a value for the metavar keyword argument within add_argument()

    // Action: Arguments can trigger different actions, specified by the action argument to 
});
*/


const ARGS = parser.parse_args();
// log(ARGS)
// process.exit();
const url = ((ARGS.minimal) ? "https://projecteuler.net/minimal=" : "https://projecteuler.net/problem=") + ARGS.problem_number;
// log({url});
(async function main() {
    const res = await axios.get(url).catch(log);
    console.table({status:res.status, statusText:res.statusText}) // wow the response is 200 even if the problem_no is out of range !
    const html = res.data

    // log(html)

    if (ARGS.minimal) {
        // only returns the problem content
        // log(html)
    } else {
        const doc = cheerio.load(html)
       // check if the problem page exists (PROBLEM NO OUT OF BOUNDS CHECK) @doc1
       if (doc("title").text() === "Archived Problems - Project Euler") {
            log("BAD REQUEST !!")
            log(ERROR_STR, ARGS.problem_number)
            process.exit(1)
        }
        const title = doc('h2').text();
        const probNo = `Problem ${ARGS.problem_number}`
        const problem_content = doc(".problem_content").text()

        const compiled_text = [title, probNo, problem_content].join("\n");
        log(compiled_text)
    }
})()

// https://stackoverflow.com/questions/57509855/expose-a-global-command-to-run-a-script-from-node-package


/* @doc1
In case the problem doesnt exist the server redirects us to the problems listing page
which has the title "Archived Problems - Project Euler" so we can check for the title
and if its not "Archived Problems - Project Euler" then the loaded page is Okay !
*/