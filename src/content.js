// Get range from point (cross-browser compatible)
function getRangeFromPoint(x, y) {
    if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos) {
            const range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.setEnd(pos.offsetNode, pos.offset);
            return range;
        }
    } else if (document.createRange) {
        // For browsers that don't support caretPositionFromPoint
        let element = document.elementFromPoint(x, y);
        if (element && element.textContent) {
            // Find the closest text node
            const walk = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            let node;
            let closest = null;
            let closestDistance = Infinity;

            while ((node = walk.nextNode())) {
                const range = document.createRange();
                range.selectNodeContents(node);
                const rect = range.getBoundingClientRect();
                const distance = Math.abs(y - rect.top) + Math.abs(x - rect.left);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closest = node;
                }
            }

            if (closest) {
                const range = document.createRange();
                range.selectNodeContents(closest);
                return range;
            }
        }
    }
    return null;
}

function handleTextClick(event) {
    // check if already select a word
    const selection = window.getSelection();
    const ori_range = selection.getRangeAt(0);
    if (ori_range) {
        const rect = ori_range.getBoundingClientRect();
        if (rect.x <= event.clientX && event.clientX <= rect.right &&
            rect.y <= event.clientY && event.y <= rect.bottom ) 
        {
            return;
        }   
    }
    
    // start handle selection
    const range = getRangeFromPoint(event.clientX, event.clientY);
    
    if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
        const node = range.startContainer;
        const text = node.textContent;
         
        // find the word selection include the cursor coordinate
        const selection = window.getSelection();
        selection.removeAllRanges();
        const words = text.split(/[^\p{L}\p{Lo}]+/u);
        let currentPosition = 0;
        for (const word of words) {
            if (!word) continue;
            const wordStart = text.indexOf(word, currentPosition);
            const wordEnd = wordStart + word.length;

            // create range for the word
            const wordRange = document.createRange();
            wordRange.setStart(node, wordStart);
            wordRange.setEnd(node, wordEnd);
            const rect = wordRange.getBoundingClientRect();
            if (rect.x <= event.clientX && event.clientX <= rect.right &&
                rect.y <= event.clientY && event.y <= rect.bottom ) 
            {
                selection.addRange(wordRange);
                // console.log("selected word = ", word);
                break;
            }

            currentPosition = wordEnd;
        }
    }
}

document.addEventListener('contextmenu', handleTextClick);