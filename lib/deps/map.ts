/** module name → installable package (browser / Pyodide-aware) */

const PYTHON_STDLIB = new Set([
    "sys", "os", "re", "json", "math", "random", "datetime", "time", "collections",
    "itertools", "functools", "typing", "pathlib", "subprocess", "threading",
    "asyncio", "http", "urllib", "hashlib", "base64", "copy", "enum", "dataclasses",
    "abc", "contextlib", "io", "struct", "array", "queue", "statistics", "decimal",
    "fractions", "string", "textwrap", "unicodedata", "traceback", "logging",
    "unittest", "doctest", "pdb", "pprint", "csv", "xml", "html", "email",
    "sqlite3", "gzip", "zipfile", "tarfile", "tempfile", "shutil", "glob",
    "fnmatch", "linecache", "pickle", "shelve", "secrets", "hmac", "ssl",
    "socket", "select", "signal", "mmap", "ctypes", "multiprocessing", "concurrent",
]);

const PYTHON_MAP: Record<string, string> = {
    numpy: "numpy",
    np: "numpy",
    pandas: "pandas",
    pd: "pandas",
    matplotlib: "matplotlib",
    plt: "matplotlib",
    scipy: "scipy",
    sympy: "sympy",
    PIL: "pillow",
    pillow: "pillow",
    requests: "requests",
    sklearn: "scikit-learn",
    cv2: "opencv-python",
    bs4: "beautifulsoup4",
    yaml: "pyyaml",
};

const JS_BUILTIN = new Set([
    "fs", "path", "http", "https", "url", "util", "os", "crypto", "stream",
    "events", "buffer", "child_process", "cluster", "net", "tls", "zlib",
    "assert", "readline", "worker_threads", "perf_hooks",
]);

const JS_MAP: Record<string, string> = {
    lodash: "lodash",
    react: "react",
    "react-dom": "react-dom",
    axios: "axios",
    express: "express",
    next: "next",
    vue: "vue",
    jquery: "jquery",
};

export function isPythonStdlib(mod: string): boolean {
    const root = mod.split(".")[0];
    return PYTHON_STDLIB.has(root);
}

export function mapPythonModule(mod: string): string | null {
    const root = mod.split(".")[0];
    if (isPythonStdlib(root)) return null;
    return PYTHON_MAP[root] ?? PYTHON_MAP[mod] ?? root;
}

export function mapJsModule(mod: string): string | null {
    if (mod.startsWith(".") || mod.startsWith("/")) return null;
    const root = mod.startsWith("@")
        ? mod.split("/").slice(0, 2).join("/")
        : mod.split("/")[0];
    if (JS_BUILTIN.has(root)) return null;
    return JS_MAP[root] ?? root;
}

/** Packages known to work reasonably in Pyodide */
export const PYODIDE_FRIENDLY = new Set([
    "numpy",
    "pandas",
    "matplotlib",
    "scipy",
    "sympy",
    "pillow",
    "requests",
    "micropip",
]);
