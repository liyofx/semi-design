export default function getUuid(prefix: string) {
    return `${prefix}-${new Date().getTime()}-${Math.random()}`;
}

// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function getUuidv4() {
    try {
        return String(1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)
        );
    } catch (err) {
        return getUuid('semi');
    }
}

/**
 * Get a random id with prefix, it not strictly guarantee id uniqueness
 * 
 * Note: the return value of getUuid is too long, we need a short one
 * 
 * @example
 * getUuidShort({ prefix: 'semi' }) => 'semi-46dinzc'
 * getUuidShort({ prefix: '' }) => '0eer2i0'
 * getUuidShort({ prefix: 'semi', length: 4 }) => 'semi-8jts'
 */
function getUuidShort({ prefix = '', length = 7 }: { prefix?: string; length?: number }) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    const total = characters.length;
    let randomId = '';
    for (let i = 0; i < length; i++) {
        const random = Math.floor(Math.random() * total);
        randomId += characters.charAt(random);
    }

    return prefix ? `${prefix}-${randomId}` : randomId;
}

export { getUuid, getUuidv4, getUuidShort };
