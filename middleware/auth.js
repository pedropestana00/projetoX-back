const jwt = require('jsonwebtoken');

// Verifica se o utilizador está autenticado (tem token válido)
function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ erro: "Acess denied. Missing Token." });

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.userLoggedIn = { 
            id_utilizador: decodificado.id,
            is_admin: decodificado.admin 
        };
        next();
    } catch (error) {
        return res.status(403).json({ erro: "Invalid or expired Token." });
    }
}

// Verifica se é um admin (para o Backoffice)
function verificarAdmin(req, res, next) {
    // Correção: Protege contra erros caso 'verificarToken' não tenha sido chamado antes
    if (!req.userLoggedIn || req.userLoggedIn.is_admin !== true ) {
        return res.status(403).json({ erro: "Access denied. Admin only." });
    }
    next();
}

module.exports = { verificarToken, verificarAdmin };

