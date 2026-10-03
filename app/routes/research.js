const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            // Fix for A3 - Reflected XSS / SSRF:
            // 1. Never take the destination host from the request (`req.query.url`) -
            //    hardcode the trusted API base so an attacker cannot redirect this
            //    server-side fetch to arbitrary infrastructure.
            // 2. HTML-encode the fetched body before writing it into the response,
            //    so even unexpected content from the trusted API can't inject markup.
            const STOCK_API_BASE = "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=";
            const symbol = encodeURIComponent(req.query.symbol);
            const url = STOCK_API_BASE + symbol;

            return needle.get(url, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    res.write(escapeHtml(body.toString()));
                }
                return res.end();
            });
        }

        return res.render("research", {
            environmentalScripts
        });
    };

}

module.exports = ResearchHandler;
