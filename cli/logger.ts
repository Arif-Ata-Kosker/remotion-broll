const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
    bold: "\x1b[1m",
};

const colorize = (color: string, text: string) => `${color}${text}${colors.reset}`;

const chalk = {
    red: (text: string) => colorize(colors.red, text),
    green: (text: string) => colorize(colors.green, text),
    yellow: (text: string) => colorize(colors.yellow, text),
    blue: (text: string) => colorize(colors.blue, text),
    magenta: (text: string) => colorize(colors.magenta, text),
    cyan: (text: string) => colorize(colors.cyan, text),
    white: (text: string) => colorize(colors.white, text),
    gray: (text: string) => colorize(colors.gray, text),
    bold: (text: string) => colorize(colors.bold, text),
};

export default chalk;
