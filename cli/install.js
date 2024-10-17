#! /usr/bin/env node

import path from "node:path"
import { execa } from "execa"

const [, scriptFile, pm = null] = process.argv

if (pm === null) {
    console.log("No package manager given, please specify one")
    process.exit(0)
}

const workerDir = path.resolve(
    path.dirname(scriptFile),
    "../worker"
)

const exec = execa({
    stdout: ['pipe', 'inherit'],
    stderr: ['pipe', 'inherit'],
    cwd: workerDir,
})

try {
    await exec`${pm} install`
}
catch (err) {
}
