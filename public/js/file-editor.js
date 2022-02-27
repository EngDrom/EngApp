

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("file-editor").addEventListener("input", function (ev) {
        
        let numberLine = Math.max(1, document.getElementById("file-editor").querySelectorAll("div>div").length)
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

