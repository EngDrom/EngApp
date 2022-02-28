function countLines(string) {
    let chr_idx;
    for (chr_idx = 0; chr_idx < string.length; chr_idx ++)
        if (string[chr_idx] != '\n')
            break
    if (chr_idx == string.length) return (string.length - 1) / 2;

    let count = 0;
    for (chr_idx = 0; chr_idx < string.length; chr_idx ++) {
        if (string[chr_idx] == '\n') {
            count += 1;
            chr_idx += 1;
        }
    }
    return count;
 }

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("file-editor").addEventListener("input", function (ev) {
        console.log(document.getElementById("file-editor").innerText.length)
        if (ev.inputType == "deleteContentBackward") {
            if (document.getElementById("file-editor").innerText.length == 0) {
                ev.preventDefault()
                return ;
            }
        }
    
        let numberLine = 1 + countLines(document.getElementById("file-editor").innerText)
        let currentNumber = document.getElementById("line-container").querySelectorAll("div>div").length

        let delta = numberLine - currentNumber
        if (delta > 0) {
            let container = document.getElementById("line-container")
            for (let i = 0; i < delta; i ++) {
                container.innerHTML += "<div></div>"
            }
        } else {
            let container = document.getElementById("line-container")
            for (let i = 0; i > delta; i --) {
                container.removeChild(container.querySelector("div>div"))
            }
        }
    })
})

