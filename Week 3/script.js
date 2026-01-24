function runReplaceAll() {
    let input = document.getElementById("replaceInput").value.trim();
    let output = input.replace(/ /g, "");
    document.getElementById("replaceOutput").innerText = output;
}

function runSearchWord() {
    let sentence = document.getElementById("sentence").value;
    let word = document.getElementById("word").value;

    if (word.trim() !== "" && sentence.includes(word)) {
        document.getElementById("searchOutput").innerText = "Found";
    } else {
        document.getElementById("searchOutput").innerText = "Not Found";
    }
}
