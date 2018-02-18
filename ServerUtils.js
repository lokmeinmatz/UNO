"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require('crypto');
function sha256(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}
exports.sha256 = sha256;
//# sourceMappingURL=ServerUtils.js.map