import { useState } from "react";
import "./CleanTravel.css";

export default function CleanTravel() {
    const [isInstalled, setIsInstalled] = useState(false);

    const scriptCode = `// ==UserScript==
// @name         Clean Travel
// @namespace    https://greasyfork.org/en/scripts/386587-clean-travel
// @version      0.3.1
// @description  Cleaner travel screen
// @author       cryosis7 [926640]
// @downloadURL  https://raw.githubusercontent.com/cryosis7/torn_userscripts/master/clean-travel/clean_travel.js
// @updateURL    https://raw.githubusercontent.com/cryosis7/torn_userscripts/master/clean-travel/clean_travel.js
// @match        *.torn.com/index.php*
// ==/UserScript==

$(window).load(function() {
    if ($('h4#skip-to-content:contains(Traveling)').length) {
        let forums = $('a:contains(Forums)');
        $(forums).appendTo($('#top-page-links-list'));
        $(forums).addClass('right line-h24');
        $(forums).css('textDecoration', 'none');

        let settings = $('a[href="/preferences.php"]')
        $(settings).appendTo($('#top-page-links-list'));
        $(settings).addClass('right line-h24');
        $(settings).removeClass('top_header_link');
        $(settings).text('Settings');
        $(settings).css('textDecoration', 'none');

        $('[class|="custom-bg"]').css('background-color', 'white');
        $('body').css('background', 'none');
        $('.stage').remove();
        $('[class*="tooltip"]').remove();
        $('[class*="popup"]').remove();
        $('[class*="header"]').remove();
        $('.delimiter-999').eq(0).remove();
    }
});`;

    const handleInstall = () => {
        const blob = new Blob([scriptCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'clean-travel.user.js';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsInstalled(true);
    };

    return (
        <div className="clean-travel">
            <div className="script-header">
                <h2>Clean Travel Screen</h2>
                <span className="category-badge">UI Enhancement</span>
            </div>
            
            <div className="script-description">
                <p>This script will clear away most of the clutter on the travel screen and is useful for when you are in a public space (like work) and want to look a little more inconspicuous while having Torn open.</p>
            </div>

            <div className="script-features">
                <h3>Features:</h3>
                <ul>
                    <li>Removes unnecessary UI elements from the travel screen</li>
                    <li>Makes the interface cleaner and more professional</li>
                    <li>Perfect for public spaces</li>
                    <li>Maintains essential functionality</li>
                </ul>
            </div>

            <div className="script-actions">
                <button
                    onClick={handleInstall}
                    disabled={isInstalled}
                    className={isInstalled ? "installed" : ""}
                >
                    {isInstalled ? "Installed" : "Install Script"}
                </button>
                <a
                    href="https://github.com/cryosis7/torn_userscripts/tree/master/clean-travel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-source"
                >
                    View Source
                </a>
            </div>
        </div>
    );
} 