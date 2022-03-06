
/**
 * File Editor API V2
 * 
 * @author LFA
 * 
 * @query [editor] : query for divs enabled by default
 * 
 * @attribute editor_div="[editable]"
 * @attribute editor_lines="[lines]"
 * @attribute file_tab_div="[tabs]"
 */

EditorPaneAPI = (function () {
    /**
     * DOM String utils
     */
    function countLines(string) {
        let chr_idx;
        for (chr_idx = 0; chr_idx < string.length; chr_idx ++)
            if (string[chr_idx] != '\n')
                break
        if (chr_idx == string.length) return 1 + (string.length - 1) / 2;
    
        let count = 1;
        for (chr_idx = 0; chr_idx < string.length; chr_idx ++) {
            if (string[chr_idx] == '\n') {
                count += 1;
                chr_idx += 1;
            }
        }
        return count;
    }
    function escape(htmlStr) {
        return htmlStr. replace(/&/g, "&amp;")
        . replace(/</g, "&lt;")
        . replace(/>/g, "&gt;")
        . replace(/"/g, "&quot;")
        . replace(/'/g, "&#39;");
    }
    function unescape(htmlStr) {
        return htmlStr. replace(/&amp;/g, "&")
        . replace(/&lt;/g, "<")
        . replace(/&gt;/g, ">")
        . replace(/&quot;/g, "\"")
        . replace(/&#39/g, "\'");
    }



    let container_by_id = {}
    let idx = 0;

    function get_selectors (element) {
        return {
            editor_div:   element.hasAttribute("editor_div")   ? element.getAttribute("editor_div")   : "[editable]",
            editor_lines: element.hasAttribute("editor_lines") ? element.getAttribute("editor_lines") : "[lines]",
            file_tab_div: element.hasAttribute("file_tab_div") ? element.getAttribute("file_tab_div") : "[tabs]"
        }
    }
    function get_subelements (element) {
        let selectors = get_selectors(element)

        return {
            editor_div:   element.querySelector(selectors.editor_div),
            editor_lines: element.querySelector(selectors.editor_lines),
            file_tab_div: element.querySelector(selectors.file_tab_div),
        }
    }

    function add_editor (element) {
        let ctx = container_by_id[idx] = {
            element: element,
            page: -1,
            tabs: {
                /*
                path: {
                    name: "index.ext",
                    path: "/path/index.ext",
                    text: "the text in the file",
                    modified: true,
                    child: document.querySelector("#something")
                }
                */
            },
            subelements: get_subelements(element)
        }
        element.setAttribute("editor_id", idx)
        idx += 1

        ctx.subelements.editor_div.addEventListener("input", (ev) => {
            if (ev.inputType == "deleteContentBackward") {
                if (ctx.subelements.editor_div.innerText.length == 0) {
                    ev.preventDefault()
                    return ;
                }
            }

            let numberLine = countLines(ctx.subelements.editor_div.innerText)
            let currentNumber = ctx.subelements.editor_lines.querySelectorAll("div>div").length
    
            let container = ctx.subelements.editor_lines;
            let delta = numberLine - currentNumber
            if (delta > 0) {
                for (let i = 0; i < delta; i ++) {
                    container.innerHTML += "<div></div>"
                }
            } else {
                for (let i = 0; i > delta; i --) {
                    container.removeChild(container.querySelector("div>div"))
                }
            }
        })

        return 
    }

    document.addEventListener("DOMSubtreeModified", () => {
        document.querySelectorAll("[editor]").forEach((el) => {
            if (el.hasAttribute("editor_id")) return ;

            add_editor(el)
        })
    });
    window.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[editor]").forEach((el) => {
            if (el.hasAttribute("editor_id")) return ;

            add_editor(el)
        })
    });

    /**
     * Close a page without save warning message
     * 
     * @param {Number} idx editor id
     * @param {String} page_path 
     */
    function close_page (idx, page_path) {

    }

    /**
     * Focus on a page
     * 
     * @param {Number} idx editor id
     * @param {String} page_path 
     */
    function focus_page (idx, page_path) {
        let container = container_by_id[idx]
        let page = container.tabs[page_path]
        if (container.page != -1) unfocus_page(idx, container.page)
        
        container.page = page_path

        page.child.classList = "group flex bg-editor.background px-2 cursor-pointer"
        page.child.querySelector(".m-2").classList = "m-2 p-1 material-icons rounded-md hover:bg-sideBarIcons.background"
    
        const lines = page.text.split("\n")

        container.subelements.editor_div.innerHTML = "<div>" + lines.map((x) => x.trim() == '' ? '<br>' + x : escape(x)).join("</div><div>") + "</div>"
        container.subelements.editor_div.dispatchEvent(new CustomEvent("input"))
    }

    /**
     * Unfocus a page to focus another
     * 
     * @param {Number} idx editor id
     * @param {String} page_path 
     */
    function unfocus_page (idx, page_path) {
        let container = container_by_id[idx]
        if (container == undefined) return ;

        let page = container.tabs[page_path]
        if (page_path == container.page) {
            let HTML = container.subelements.editor_div.innerHTML;
            HTML = HTML.substring(5, HTML.length - 6)
            const lines = HTML.replace(/<br>/g, '').split('</div><div>')
            page.text = (lines.map(unescape)).join("\n")
        }

        page.child.classList = "group flex bg-sideBarIcons.background px-2 cursor-pointer"
        page.child.querySelector(".m-2").classList = "m-2 p-1 material-icons rounded-md text-sideBarIcons.background group-hover:text-editorIndentGuide.activeBackground hover:bg-menu.background"
    }

    /**
     * Create page in editor
     * 
     * @param {*} idx editor id
     * @param {*} page_name 
     * @param {*} page_path 
     * @param {*} page_text 
     * @returns whether the page was really created
     */
    function add_page (idx, page_name, page_path, page_text) {
        let container = container_by_id[idx]
        if (Object.keys(container.tabs).includes(page_path))
            return false;

        let child = document.createElement("div")
        child.classList = "group flex bg-sideBarIcons.background px-2 cursor-pointer"
        child.innerHTML = `
            <div class="p-3 material-icons">code</div>
            <p class="align-middle h-min relative top-[50%] translate-y-[-50%]" page_name>${page_name}</p>
            <div class="m-2 p-1 material-icons rounded-md text-sideBarIcons.background group-hover:text-editorIndentGuide.activeBackground hover:bg-menu.background">close</div>
        `

        container.tabs[page_path] = {
            name: page_name,
            path: page_path,
            text: page_text,
            modified: false,
            child: child
        }

        container.subelements.file_tab_div.appendChild(child)
        child.onclick = (ev) => {
            focus_page(idx, page_path)
        }

        if (container.page == -1) focus_page(idx, page_path)
    }

    return {
        add_page: add_page,
        focus_page: focus_page
    }
})();

/*
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
*/
