/**
 * Calculate the sum of two numbers
 */
function calculateSum(a, b) {
    return a + b;
}

/**
 * Get user information from database
 */
async function getUserInfo(userId) {
    const user = await database.findById(userId);
    return user;
}

const processData = (data) => {
    return data.map(item => item.value);
};

/**
 * Validate user input
 */
function validateInput(input) {
    if (!input) {
        throw new Error('Input is required');
    }
    return true;
}

function findMaxValue(array) {
    return Math.max(...array);
}

async function fetchUserData(id) {
    try {
        const response = await fetch(`/api/users/${id}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}