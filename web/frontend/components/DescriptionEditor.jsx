import React from "react";
import Trix from "trix";

function DescriptionEditor() {
    return (
        <>
            <input
                type="hidden"
                id="trix"
            />
            <trix-editor input="trix" style={{ minHeight: '250px', overflowY: 'auto' }} />
        </>
    );
}

export default DescriptionEditor;