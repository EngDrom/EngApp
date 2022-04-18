
// There is a bug somewhere that makes a span happens out of nowhere
// Might be due to characters at the beginning of lines

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
 * 
 * @attribute api_listener : attribute containing the window api that must be listened to
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
    /**
     * Transform a text with lines because \n * (2k - 1) is in reality \n * k
     * @param {String} text 
     */
    function removeDuplicateLines (text) {
        let lines = text.split("\n")
        for (let idx = 0; idx < lines.length - 1; idx ++) {
            if (lines[idx] == '' && lines[idx + 1] == '') {
                lines.splice(idx, 1)
            }
        }

        return lines.join("\n")
    }
    function escape(htmlStr) {
        return htmlStr. replace(/&/g, "&amp;")
        . replace(/</g, "&lt;")
        . replace(/>/g, "&gt;")
        . replace(/"/g, "&quot;")
        . replace(/'/g, "&#39;")
        . replace(/ /g, "&nbsp;");
    }
    function unescape(htmlStr) {
        return htmlStr. replace(/&amp;/g, "&")
        . replace(/&lt;/g, "<")
        . replace(/&gt;/g, ">")
        . replace(/&quot;/g, "\"")
        . replace(/&#39/g, "\'")
        . replace(/&nbsp;/g, " ");
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

        if (element.hasAttribute("api_listener")) {
            window.api.receive(element.getAttribute("api_listener"), (event, ...args) => {
                let idx = Number(element.getAttribute("editor_id"))
                let page_path = args[0]
                let page = args[0].split(/(\/|\\)/g)
                let page_name = page[page.length - 1] == '' ? page[page.length - 2] : page[page.length - 1]
                let page_text = args[1]
                console.log(page_name)
                console.log(page_path)
                console.log(page_text)
                add_page(idx, page_name, page_path, page_text)
            })
        }

        ctx.subelements.editor_div.addEventListener("input", (ev) => {
            if (ev.inputType == "deleteContentBackward") {
                if (ctx.subelements.editor_div.innerText.length == 0) {
                    ev.preventDefault()
                    return ;
                }
            }

            let numberLine = ctx.subelements.editor_div.querySelectorAll("div>div").length
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


        let container = container_by_id[idx]
        let page = container.tabs[page_path]

        let alternative = undefined
        for (let key of Object.keys(container.tabs)) {
            if (container.tabs[key] && key != page_path) {
                alternative = key;
                break;
            }
        }

        if (alternative == undefined) return ;

        let child = page.child
        child.onclick = undefined
        child.parentNode.removeChild(child)

        if (container.page == page_path) {
            focus_page(idx, alternative)
        }

        container.tabs[page_path] = undefined
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
        container.subelements.editor_div.innerHTML = "<div>" + escape(page.text).replace(/\n/g, "</div><div>") + "</div>"
        container.subelements.editor_div.dispatchEvent(new CustomEvent("input"))
    }

    /**
     * Save a page and get the text out of the editor
     */
    function save_page ( container, page ) {
        let HTMLArr = []
        container.subelements.editor_div.querySelectorAll('div>div').forEach((el) => {
            HTMLArr.push(el.innerText.split('\n').join('').split(' ').join(' '));
        });
        page.text = HTMLArr.join('\n')
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
        if (page_path == container.page) save_page(container, page)

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
            <div close-tab class="m-2 p-1 material-icons rounded-md text-sideBarIcons.background group-hover:text-editorIndentGuide.activeBackground hover:bg-menu.background">close</div>
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
        child.querySelector('[close-tab]').onclick = (ev) => {
            close_page(idx, page_path)
        }

        if (container.page == -1) focus_page(idx, page_path)
    }


    window.api.receive('shortcut', (event, ...args) => {
        if (args.length >= 1 && args[0] == 'file:save') {
            let curElement = document.activeElement
            while ((!curElement.hasAttribute("editor")) && curElement != document.body) curElement = curElement.parentNode

            if (curElement.hasAttribute("editor")) {
                let idx = Number(curElement.getAttribute("editor_id"))
                let container = container_by_id[idx]
                let page = container.page

                if (page != -1) {
                    // Force cleaning of the page text
                    save_page(container, container.tabs[page])

                    let tab = container.tabs[page]
                    let text = tab.text

                    window.api.send("engine:file:save", project, tab.path, text)
                }
            }
        }
    })

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
