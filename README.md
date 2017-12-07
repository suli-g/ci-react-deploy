# Name Pending...
A simple script for converting and templating a frontend index file into a backend file (like php).

## Prerequisites
1. [Node js](https://nodejs.org/) updated to latest version (needs to support es6).
2. An `index.html` file in the same directory as `deploy.js`.
3.* Support for [rsync.js](https://www.npmjs.com/package/rsync)
  * If you are on a windows 10 PC, then I recommend getting the Windows subsystem for Linux:
    * [what's that?](https://msdn.microsoft.com/en-us/commandline/wsl/about)
    * [where do I get it?](https://msdn.microsoft.com/en-us/commandline/wsl/install-win10)
    
## Getting started
1. Download `deploy.js` and place it inside your project root directory.
2. run `node deploy` in the directory containing [the script](#script).

## Blueprint
The default behaviour may not be the most desirable so the program allows a `blueprint` to be declared in 3 ways:
1. As an argument when `node deploy` is executed (e.g. `node deploy ./some_file.json`)
2. As a field in `package.json` - should be called "blueprint" and can be either a string or an object:
    * If `blueprint` is a string - it should be a path to a file containing a `blueprint` object.
    * If `blueprint` is an object - it should follow the blueprint layout to be useful.

### Blueprint Layout

|Field|Type|Default
|:---|:---:|---:|
| src | string |"."
| outlet| string |"."
| build| string |"build"
| assets| string |"{outlet}"
| views| string |"{outlet}"
| index_file| string |"index.php"|
| template_input| array | `[["__","[a-zA-Z]\\w*"]]` |
| template_output| array | `[["<?=$", "?>"]]` |

### Template rules:
1. `template_output & template_input`:
    * should have the same length.
2. `template_input`:
    * should be an array of arrays or strings
        * if an element is a string, it will be appended to an empty array.

3. `template_output`:
    * should be an array of arrays (`* or some other data structure which meets the below criteria`)
        * each child array should have an entry at indices 0 and 1 (this is how the program grabs templates)

###  `template_input`:
Each entry in the `template_input` array should have an output matching `^[^()\s]+\([^()]+\)[^()\s]+$` (like `abc(sdasdasd)abc`)
* If you define a `template_input` field without a `template_output` field - then `template_input` must have a maximum length of 1.

Children of the `template_input` array are treated in 4 distinct ways depending upon their length:

| length | behaviour | input | output |
|:---:|---|---|---|
| 1 | treat entire entry as desired regular expression | `['__(\w*)__']` | `/__(\w*)__/g` |
| 2 | treat (0) as capture group and (1) as both template tags. | `['__', '\w*']` | `/__(\w*)__/g` |
| 3 | treat (1) as the capture group, then (0) and (2) as template tags | `['__', '\w*', _n]` | `/__(\w*)_n/g` |
| (n, k; n > 3, 0 < k < n-1) | `rule[n]` | `['_a_', ...g, _b_]` | `/_a_(...g)_b_/g` |
| `rule [0]` | treat as opening tag | `*` | `_a_` |
| `rule [k]` | treat as closing tag | `*` | `_b_` |
| `rule [n-1]` | treat as pipe separated capture group | `*` | `(g[0]\|g[1]...\|g[n-1])` |

--

#### `template_output`
Each entry in `template_output` should be an array of length 2. The program uses indices to select items from `template_output`, therefore if the user instead uses a string or array-like object, it will still work).

|match|output array|result|
|:---|---|---|
|`__(dog flew)__`|`["The ", " up high"]`|`The dog flew up high`|

* Notice that the capture group (ex. `(stuff)`) is absolutely necessary.


#### Error handling:
The program runs through 5 checks for every `input_template` and throws an exception accordingly when a check fails.

# The 5 Checks:
1. Template tags
    * non-parenthesis match at start of regex
    * non-parenthesis match at end of regex
2. Capture group
    * left parenthesis
    * stuff between parentheses
    * right parenthesis

a. Since these are sort of core checks, They haven't been made modifiable except in the source code.
b. The source code, now in its initial stages, is super messy.
c. There are plans to make it es6-classical later on.

Exceptions for templates use the following format:

(node:12345) Warning: template error
index1: regex1 | error1
index2: regex2 | error1

(the words above are placeholders for actual things)
## Example usage (coming soon)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

--- 
[1] : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
[2] : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
[3] : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
