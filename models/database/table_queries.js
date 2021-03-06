module.exports = {
    /**
     * Get query string for select a structure of the table
     * @param {object} TableModel an instance of the Table class
     * @returns {string} SQL query
     */
    getStructure(TableModel) {
        return `SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${TableModel.database}' AND TABLE_NAME='${TableModel.name}' ORDER BY ORDINAL_POSITION;`
    },

    /**
     * Get query string for select all content in the table
     * @param {object} TableModel an instance of the Table class
     * @returns {string} SQL query
     */
    getContent(TableModel) {
        return `SELECT * FROM \`${TableModel.database}\`.\`${TableModel.name}\`;`
    },

    /**
     * Get query string for alter the order of column
     * @param {object} TableModel an instance of the Table class
     * @param {object} state current state of the row 
     * @param {string} after a name of the row after which will be placed
     * @returns {string} SQL query
     */
    changeOrder(TableModel, state, after) {
        const { COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA } = state

        const nullable = IS_NULLABLE === 'YES' ? 'NULL ' : 'NOT NULL '
        const __default = COLUMN_DEFAULT !== null ? `DEFAULT '${COLUMN_DEFAULT}' ` : ''
        const extras = EXTRA !== '' ? `${EXTRA.toUpperCase()} ` : ''
        const position = after !== 'FIRST' ? `AFTER \`${after}\`` : 'FIRST'

        const changeString = `COLUMN \`${COLUMN_NAME}\` \`${COLUMN_NAME}\` ${COLUMN_TYPE.toUpperCase()} ${nullable}${__default}${extras}${position}`

        return `ALTER TABLE \`${TableModel.database}\`.\`${TableModel.name}\` CHANGE ${changeString};`
    },

    /**
     * Get query string for insert a new row to the table
     * @param {object} TableModel an instance of the Table class
     * @param {object} data data for insert
     * @returns {string} SQL query
     */
    saveRow(TableModel, data) {
        const wrappedCollumns = Object.keys(data).map(column => `\`${column}\``).join(', ')
        const wrappedValues = Object.values(data).map(value => `'${value}'`).join(', ')

        return `INSERT INTO \`${TableModel.database}\`.\`${TableModel.name}\` (${wrappedCollumns}) VALUES (${wrappedValues});`
    },

    /**
     * Get query string for delete a row from the table
     * @param {object} TableModel an instance of the Table class
     * @param {number} id a primary key of the row
     * @returns {string} SQL query
     */
    deleteRow(TableModel, id) {
        return `DELETE FROM \`${TableModel.database}\`.\`${TableModel.name}\` WHERE (\`${TableModel.primary_name}\` = '${id}');`
    },

    /**
     * Get query string for update a row in the table
     * @param {object} TableModel an instance of the Table class
     * @param {number} id a primary key of the row
     * @param {object} data new data for the row
     * @returns {string} SQL query
     */
    editRow(TableModel, id, data) {
        const wrappedCollumns = Object.keys(data).map(column => `\`${column}\``)
        const wrappedValues = Object.values(data).map(value => `'${value}'`)

        let setString = []

        for (let index in wrappedCollumns) {
            setString.push(`${wrappedCollumns[index]} = ${wrappedValues[index]}`)
        }

        setString = setString.join(', ')

        return `UPDATE \`${TableModel.database}\`.\`${TableModel.name}\` SET ${setString} WHERE (\`${TableModel.primary_name}\` = '${id}');`
    }
}