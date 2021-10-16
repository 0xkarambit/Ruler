#!/usr/bin/env node
import axios from "axios"
import * as cheerio from "cheerio"
import * as argparse from "argparse"

const {ArgumentParser} = argparse

// aliases and helper functions
const log = console.log;

const red = "\x1b[91m"
const redend = "\x1b[0m"

const exit = (msg, code = 1) => {
    process.stderr.write(`${red}${msg}${redend}`);
    process.exit(code)
}

// parsing arguments
const parser = new ArgumentParser({
    description: 'Ruler [rule] projecteuler.net problems automator !',
    add_help: true,
})

// https://github.com/nodeca/argparse/blob/master/doc/migrate_v1_to_v2.md
// >> help(argparse) in bpython
/*
    https://stackoverflow.com/questions/19124304/what-does-metavar-and-action-mean-in-argparse-in-python
    https://stackoverflow.com/a/43660050/9596267
*/
parser.add_argument('-v', '--version', { action: 'version', version:"version1.2.3" });
parser.add_argument('-m', '--minimal', { help: 'specify if minimal page should be scraped [doesnt include the title]',
    action: "store_true",
    default: false
 });
parser.add_argument("problem_number", {help : "the problem to fetch [number]", metavar: "P", nargs: 1, type:"int"})
parser.add_argument("-O", "--output", {
    help :"file to write the problem info to",
    metavar: "OUT_FILE",
    dest: "OUT_FILE",
    type: argparse.FileType("w+")
})


const ARGS = parser.parse_args();
// log(ARGS)

const url = ((ARGS.minimal) ? "https://projecteuler.net/minimal=" : "https://projecteuler.net/problem=") + ARGS.problem_number;
// log({url});

function write(text) {
    if (ARGS.OUT_FILE) {
        ARGS.OUT_FILE.write(text);
    } else {
        log(text)
    }
}

(async function main() {
    const res = await axios.get(url).catch(log);
    const html = res.data

    if (ARGS.minimal) {
        // only returns the problem content
        // on the minimal endpoint this string is returned when page is not found.
        if (html == "Data for that problem cannot be found")
            exit(`ERROR: Data for that problem cannot be found\n`)
        write(html)
    } else {
        const doc = cheerio.load(html)
       // check if the problem page exists (PROBLEM NO OUT OF BOUNDS CHECK) | @doc1
       if (doc("title").text() === "Archived Problems - Project Euler") {
            exit(`ERROR: Data for that problem cannot be found\n`)
        }
        const title = doc('h2').text();
        const probNo = doc('#problem_info').text();
        const problem_content = doc(".problem_content").text();

        const compiled_text = [title, probNo, problem_content].join("\n");
        write(compiled_text)

    }
})()

// https://stackoverflow.com/questions/57509855/expose-a-global-command-to-run-a-script-from-node-package


/* @doc1
In case the problem doesnt exist the server redirects us to the problems listing page
which has the title "Archived Problems - Project Euler" so we can check for the title
and if its not "Archived Problems - Project Euler" then the loaded page is Okay !
*/
