// src/middleware/auth.js

/**
 * Role-Based Access Control (RBAC) Middleware
 * Added support for self-updating by checking x-user-id header
 * @param {Array} allowedRoles - List of roles permitted to access the route
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {

        // 1. Read the current user's role and ID from request headers
        const userRole = req.headers['x-user-role'];
        const currentUserId = req.headers['x-user-id'];

        const targetUserId = req.params.id;

        // 2. Check if the required headers exist
        if (!userRole) {
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "Missing user role header.",
                    details: {}
                }
            });
        }

        // 3. Logic: Allow if role is authorized OR if user is editing their own profile
        const isAuthorizedByRole = allowedRoles.includes(userRole);
        const isEditingSelf = targetUserId && currentUserId && String(targetUserId) === String(currentUserId);

        if (isAuthorizedByRole || isEditingSelf) {
            // Access permitted - move to the next handler
            next();
        } else {
            // 4. Return an authorization error if access is denied
            return res.status(403).json({
                success: false,
                data: null,
                error: {
                    code: "FORBIDDEN",
                    message: "You do not have permission to perform this action.",
                    details: {
                        requiredRoles: allowedRoles,
                        yourRole: userRole,
                        isEditingSelf: isEditingSelf
                    }
                }
            });
        }
    };
};

module.exports = authorize;