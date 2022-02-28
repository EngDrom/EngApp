
/**
 * Split pane V2
 * 
 * @author LFA
 * 
 * @query [splitpane] : div enabled by default for the split pane system
 * 
 * @attribute first_selector : target of the first area of the split pane or #first if not found
 *  - used in querySelector API of navigator
 * @attribute second_selector : target of the second area of the split pane or #second if not found
 *  - used in querySelector API of navigator
 * @attribute separator : target of the separator area of the split pane or #separator if not found
 *  - used in querySelector API of navigator
 * 
 * @attribute horizontal | vertical : direction of split pane
 */

const SplitPaneAPI = (function () {
    // Exposed API to add elements that would not be used by default
    const elements_subscribed = new Set();
    function subscribe (el) { 
        elements_subscribed.add(el)
        dragElement(el);
    }
    function unsubscribe (el) { 
        elements_subscribed.remove(el)
    }

    // Private subscribe function
    function dragElement (element) {
        const isHorizontal = element.hasAttribute("horizontal")
        const isVertical   = element.hasAttribute("vertical")

        if (!(isHorizontal ^ isVertical)) throw 'There must be one of the two attributes on the splitpane component (horizontal, vertical)'

        const first_selector  = element.hasAttribute("first_selector")  ? element.getAttribute("first_selector")  : "#first"
        const second_selector = element.hasAttribute("second_selector") ? element.getAttribute("second_selector") : "#second"

        const first_element  = element.querySelector(first_selector)
        const second_element = element.querySelector(second_selector)
        
        const separator_selector = element.hasAttribute("separator") ? element.getAttribute("separator") : "#separator"
        const separator_element  = element.querySelector(separator_selector)

        let property_cur = isVertical ? "height"    : "width"  
        let property_max = isVertical ? "maxHeight" : "maxWidth"

        first_element.style[property_cur]  = first_element.getBoundingClientRect()[property_cur] / element.getBoundingClientRect()[property_cur] * 100 + "%"
        second_element.style[property_cur] = second_element.getBoundingClientRect()[property_cur] / element.getBoundingClientRect()[property_cur] * 100 + "%"

        first_element.style[property_max]  = first_element.style[property_cur]        
        second_element.style[property_max] = second_element.style[property_cur]        

        // Current status
        let grab_status = { enabled: false }

        function mouse_down_listener (event) {
            grab_status = { 
                enabled: true,
                first_start:  Number( first_element.style[property_cur].replace("%", "")),
                second_start: Number(second_element.style[property_cur].replace("%", "")),
                sx: event.clientX,
                sy: event.clientY
            }
            document.body.classList.add(isHorizontal ? "cursor-w-resize" : "cursor-n-resize")
        }
        function mouse_up_listener (event) {
            grab_status = { enabled: false }
            document.body.classList.remove(isHorizontal ? "cursor-w-resize" : "cursor-n-resize")
        }
        function mouse_move_listener (event) {
            if (!grab_status.enabled) return ;

            let delta = isVertical ? event.clientY - grab_status.sy : 
                                     event.clientX - grab_status.sx

            let delta_percentage = delta / element.getBoundingClientRect()[property_cur] * 100

            first_element.style[property_cur]  = (grab_status.first_start  + delta_percentage) + "%"
            second_element.style[property_cur] = (grab_status.second_start - delta_percentage) + "%"

            first_element.style[property_max]  = first_element.style[property_cur]        
            second_element.style[property_max] = second_element.style[property_cur]     
        }

        separator_element.addEventListener ("mousedown", mouse_down_listener);

        document.addEventListener ("mouseup", mouse_up_listener);
        document.addEventListener ("mousemove", mouse_move_listener);
    }


    document.addEventListener('DOMSubtreeModified', function(){
        setTimeout((el)=>{
            document.querySelectorAll('[splitpane]').forEach((el) => dragElement(el))
        }, 0)
      });  
    window.addEventListener('DOMContentLoaded', (function(){
        setTimeout((el)=>{
            document.querySelectorAll('[splitpane]').forEach((el) => dragElement(el))
        }, 0)
      })); 

    // Exposed api
    return {
        subscribe, unsubscribe
    }
})();