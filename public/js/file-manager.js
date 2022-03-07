
function get_icon (tree_data) {
    if (tree_data.name.endsWith(".css")) return "tag";
    if (tree_data.name.endsWith(".html")) return "code";
    if (tree_data.name.endsWith(".js")) return "javascript";
    if (tree_data.name.endsWith(".bat") || tree_data.name.endsWith(".sh")) return "terminal";

    return "description";
}
function get_icon_color (tree_data) {
    if (tree_data.is_dir) return ;

    if (tree_data.name.endsWith(".css")) return "text-sky-600";
    if (tree_data.name.endsWith(".html")) return "text-orange-500";
    if (tree_data.name.endsWith(".js")) return "text-yellow-500";
    if (tree_data.name.endsWith(".bat") || tree_data.name.endsWith(".sh")) return "text-green-700";
}

function get_font_size(tree_data) {
    if (tree_data.name.endsWith(".html")) return 16;
    return 24;
}

const project = window.location.search.replace('?proj=', '')
const project_path = project.split("/")
const project_name = project_path[project_path.length - 1] == "" ? project_path[project_path.length - 2] : project_path[project_path.length - 1]

window.api.send("read_tree", project)

function build_tree (tree_data, depth=0) {
    let child = document.createElement("div")
    child.classList.add("cursor-pointer")
    child.setAttribute("tree_path", tree_data.path)

    child.innerHTML = `
<div class="flex" style="padding-left: ${12 * depth + 16}px;" ${tree_data.is_dir ? `id="file-folder"` : `id="file-file"`}>
    <div class="material-icons ${get_icon_color(tree_data)}" style="font-size: ${get_font_size(tree_data)}px; padding-left: ${12 - get_font_size(tree_data) / 2}px; padding-right: ${16 - get_font_size(tree_data) / 2}px; padding-top: ${13 - get_font_size(tree_data) / 2}px; padding-bottom: ${12 - get_font_size(tree_data) / 2}px;" id="icon">${tree_data.is_dir ? "chevron_right" : get_icon(tree_data)}</div>
    <div class="text-xl">${(tree_data.name == "." || tree_data.path == project_path) ? project_name : tree_data.name}</div>
</div>

<div class="hidden" id="next">
</div>`
    let next_data = child.querySelector("#next");

    if (tree_data.is_dir) {
        tree_data.data.sort((a, b) => b.is_dir - a.is_dir).forEach((el) => {
            next_data.appendChild(build_tree((el), depth + 1))
        })
    }

    return child;
}

window.api.receive("read_tree", (event, ...args) => {
    let data = JSON.parse(args[0])

    let tree = build_tree(data, 0)
    let container = document.querySelector("#file-container")
    container.innerHTML = ""
    container.appendChild(tree)
})

function toggleFolder (folder) {
    folder = folder.target
    while (folder.id != "file-folder") folder = folder.parentNode
    folder = folder.parentNode

    folder.querySelectorAll("div#icon").forEach((el) => {
        if (el.parentNode.parentNode == folder) {
            el.innerText = el.innerText == "chevron_right" ? "expand_more" : "chevron_right"
        }
    })

    folder.querySelectorAll("div#next").forEach((el) => {
        if (el.parentNode == folder) {
            el.classList.toggle("hidden")
        }
    })
}

function openFile (event) {
    let target = event.target
    while (target.id != "file-file") target = target.parentNode;

    let path = target.parentNode.getAttribute("tree_path")
    window.api.send("engine:file:read", project, path)
}

document.addEventListener('DOMSubtreeModified', function(){
    document.querySelectorAll('#file-folder').forEach((el) => {
        el.onclick = el.onclick == undefined ? toggleFolder : el.onclick
    })
    document.querySelectorAll('#file-file').forEach((el) => {
        el.onclick = el.onclick == undefined ? openFile : el.onclick
    })
  });  
window.addEventListener('DOMContentLoaded', (function(){
    document.querySelectorAll('#file-folder').forEach((el) => el.onclick = toggleFolder)
    document.querySelectorAll('#file-file').forEach((el) => el.onclick = openFile)
  }));
