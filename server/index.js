import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// ================= DATABASE =================
const db = new Database(path.join(__dirname, 'nlqp.db'));
console.log('✅ Connected to SQLite Database');

db.pragma('journal_mode = WAL');

// ================= STOP WORDS LIST =================
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'for', 'from',
  'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such',
  'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to',
  'was', 'will', 'with', 'have', 'has', 'had', 'do', 'does', 'did', 'can',
  'could', 'would', 'should', 'may', 'might', 'must', 'shall', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'above',
  'below', 'after', 'before', 'between', 'during', 'about', 'across', 'against',
  'along', 'among', 'around', 'behind', 'beneath', 'beside', 'beyond'
]);

// ================= SYMBOL TABLE =================
class SymbolTable {
  constructor() {
    this.symbols = [];
  }

  addSymbol(name, type, value = '') {
    const symbol = {
      name: String(name).trim() || 'UNKNOWN',
      type: String(type).toUpperCase() || 'UNKNOWN',
      value: String(value).trim() || ''
    };
    this.symbols.push(symbol);
    return symbol;
  }

  getAll() {
    return this.symbols;
  }
}

// Initialize database
function initializeDatabase() {
  try {
    db.exec(`
      DROP TABLE IF EXISTS students;
      DROP TABLE IF EXISTS lakshya;
      DROP TABLE IF EXISTS employees;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS departments;
      DROP TABLE IF EXISTS orders;
    `);

    db.exec(`
      CREATE TABLE students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        email TEXT,
        course TEXT,
        gpa REAL,
        enrollment_date TEXT
      );
      
      CREATE TABLE lakshya (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        email TEXT,
        course TEXT,
        gpa REAL,
        enrollment_date TEXT
      );
      
      CREATE TABLE employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT,
        salary REAL,
        joining_date TEXT,
        manager_id INTEGER
      );
      
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL,
        stock INTEGER,
        category TEXT,
        supplier_id INTEGER
      );
      
      CREATE TABLE departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        budget REAL,
        head_id INTEGER
      );
      
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        student_id INTEGER,
        quantity INTEGER,
        order_date TEXT,
        total_amount REAL
      );
    `);

    const insertStudent = db.prepare(`INSERT INTO students (name, age, email, course, gpa, enrollment_date) VALUES (?, ?, ?, ?, ?, ?)`);
    insertStudent.run('John Doe', 20, 'john@example.com', 'Computer Science', 3.8, '2023-01-15');
    insertStudent.run('Jane Smith', 21, 'jane@example.com', 'Engineering', 3.9, '2023-02-10');
    insertStudent.run('Bob Wilson', 19, 'bob@example.com', 'Business', 3.5, '2023-03-20');
    insertStudent.run('Alice Johnson', 22, 'alice@example.com', 'Computer Science', 3.7, '2022-09-01');

    const insertlakshya = db.prepare(`INSERT INTO lakshya (name, age, email, course, gpa, enrollment_date) VALUES (?, ?, ?, ?, ?, ?)`);
    insertlakshya.run('lakshya Singh', 22, 'lakshya.singh@example.com', 'Data Science', 3.9, '2023-01-10');
    insertlakshya.run('lakshya Kumar', 23, 'lakshya.kumar@example.com', 'AI/ML', 3.8, '2022-12-05');
    insertlakshya.run('lakshya Patel', 21, 'lakshya.patel@example.com', 'Computer Science', 3.6, '2023-06-15');

    const insertEmployee = db.prepare(`INSERT INTO employees (name, department, salary, joining_date, manager_id) VALUES (?, ?, ?, ?, ?)`);
    insertEmployee.run('Alice Manager', 'IT', 85000, '2020-01-15', null);
    insertEmployee.run('Bob Developer', 'IT', 65000, '2021-03-20', 1);
    insertEmployee.run('Charlie Designer', 'IT', 60000, '2021-06-10', 1);
    insertEmployee.run('Diana Manager', 'HR', 75000, '2019-11-05', null);
    insertEmployee.run('Eve HR', 'HR', 55000, '2022-01-10', 4);

    const insertProduct = db.prepare(`INSERT INTO products (name, price, stock, category, supplier_id) VALUES (?, ?, ?, ?, ?)`);
    insertProduct.run('Laptop', 999.99, 50, 'Electronics', 1);
    insertProduct.run('Mouse', 25.99, 200, 'Electronics', 1);
    insertProduct.run('Keyboard', 79.99, 150, 'Electronics', 2);
    insertProduct.run('Monitor', 299.99, 75, 'Electronics', 2);

    const insertDept = db.prepare(`INSERT INTO departments (name, budget, head_id) VALUES (?, ?, ?)`);
    insertDept.run('IT', 500000, 1);
    insertDept.run('HR', 300000, 4);

    const insertOrder = db.prepare(`INSERT INTO orders (product_id, student_id, quantity, order_date, total_amount) VALUES (?, ?, ?, ?, ?)`);
    insertOrder.run(1, 1, 2, '2024-01-15', 1999.98);
    insertOrder.run(2, 2, 5, '2024-01-20', 129.95);
    insertOrder.run(3, 3, 1, '2024-02-01', 79.99);

    console.log('✅ Database initialized with all data');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

initializeDatabase();

// ================= GET TABLE NAMES =================
function getTableNames() {
  try {
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).all();
    return tables.map(t => t.name);
  } catch (err) {
    return [];
  }
}

// ================= GET TABLE COLUMNS =================
function getTableColumns(tableName) {
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.map(col => ({
      name: col.name,
      type: col.type,
      notnull: col.notnull === 1,
      default: col.dflt_value,
      pk: col.pk === 1
    }));
  } catch (err) {
    return [];
  }
}

// ================= GET DATABASE SCHEMA =================
function getDatabaseSchema() {
  const schema = {};
  const tables = getTableNames();
  for (const table of tables) {
    schema[table] = getTableColumns(table);
  }
  return schema;
}

// ================= SAFE TABLE LOOKUP =================
function getActualTableName(inputName) {
  if (!inputName) return null;
  const tables = getTableNames();
  const searchName = String(inputName).trim().toLowerCase();
  
  for (const table of tables) {
    if (table === inputName) return table;
  }
  
  for (const table of tables) {
    if (table.toLowerCase() === searchName) return table;
  }
  
  return null;
}

// ================= RBNLP PARSER =================
class RBNLPParser {
  constructor(query) {
    this.query = query.trim();
    this.analysis = {
      original: query,
      tokens: [],
      stopWords: [],
      removedStopWords: [],
      queryType: 'UNKNOWN',
      tableName: '',
      columns: [],
      whereCondition: '',
      havingCondition: '',
      groupByColumns: [],
      orderByColumns: [],
      limitValue: null,
      symbolTable: new SymbolTable(),
      parseTree: null
    };
  }

  // STEP 1: Tokenize and remove stop words
  tokenize() {
    const words = this.query.toLowerCase().split(/\s+/).filter(w => w);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[,;()=<>!*'"`]/g, '');
      
      if (STOP_WORDS.has(cleanWord)) {
        this.analysis.stopWords.push(cleanWord);
        this.analysis.removedStopWords.push(cleanWord);
      } else {
        this.analysis.tokens.push(word);
        this.analysis.symbolTable.addSymbol(word, 'TOKEN', word);
      }
    });

    console.log('✅ Tokens:', this.analysis.tokens);
    console.log('✅ Stop Words:', this.analysis.stopWords);
  }

  // STEP 2: Identify query type
  identifyQueryType() {
    const q = this.query.toLowerCase();
    
    if (/^(show|display|list|view)\b/.test(q)) {
      this.analysis.queryType = 'SHOW';
    } else if (/^(select|find|fetch|retrieve|get)\b/.test(q)) {
      this.analysis.queryType = 'SELECT';
    } else if (/^(count|how\s+many)\b/.test(q)) {
      this.analysis.queryType = 'COUNT';
    } else if (/^(insert|add)\b/.test(q)) {
      this.analysis.queryType = 'INSERT';
    } else if (/^(update|modify|change|set)\b/.test(q)) {
      this.analysis.queryType = 'UPDATE';
    } else if (/^delete\s+(?:column|field)\b/.test(q)) {
      this.analysis.queryType = 'DELETE_COLUMN';
    } else if (/^(delete|remove)\b/.test(q)) {
      this.analysis.queryType = 'DELETE';
    } else if (/^(create|make)\b/.test(q)) {
      this.analysis.queryType = 'CREATE';
    } else if (/^(drop|remove)\b/.test(q)) {
      this.analysis.queryType = 'DROP';
    } else if (/^(alter|modify|change)\b/.test(q)) {
      this.analysis.queryType = 'ALTER';
    }

    console.log('✅ Query Type:', this.analysis.queryType);
  }

  // STEP 3: Extract table name
  extractTableName() {
    const tables = getTableNames();
    
    // Try exact matches first (case-insensitive)
    for (const table of tables) {
      if (new RegExp(`\\b${table}\\b`, 'i').test(this.query)) {
        this.analysis.tableName = table;
        this.analysis.symbolTable.addSymbol(table, 'TABLE', table);
        console.log('✅ Table (exact match):', table);
        return;
      }
    }
    
    // For CREATE, ALTER, INSERT, UPDATE, DELETE, DROP - extract from specific positions
    const q = this.query.toLowerCase();
    
    // CREATE TABLE name
    const createMatch = q.match(/create\s+table\s+(\w+)/i);
    if (createMatch) {
      this.analysis.tableName = createMatch[1];
      this.analysis.symbolTable.addSymbol(createMatch[1], 'TABLE', createMatch[1]);
      console.log('✅ Table (CREATE):', createMatch[1]);
      return;
    }
    
    // INSERT INTO name
    const insertMatch = q.match(/insert\s+into\s+(\w+)/i);
    if (insertMatch) {
      this.analysis.tableName = insertMatch[1];
      this.analysis.symbolTable.addSymbol(insertMatch[1], 'TABLE', insertMatch[1]);
      console.log('✅ Table (INSERT):', insertMatch[1]);
      return;
    }
    
    // UPDATE name
    const updateMatch = q.match(/update\s+(\w+)/i);
    if (updateMatch) {
      this.analysis.tableName = updateMatch[1];
      this.analysis.symbolTable.addSymbol(updateMatch[1], 'TABLE', updateMatch[1]);
      console.log('✅ Table (UPDATE):', updateMatch[1]);
      return;
    }
    
    // DELETE FROM name
    const deleteMatch = q.match(/delete\s+from\s+(\w+)/i);
    if (deleteMatch) {
      this.analysis.tableName = deleteMatch[1];
      this.analysis.symbolTable.addSymbol(deleteMatch[1], 'TABLE', deleteMatch[1]);
      console.log('✅ Table (DELETE):', deleteMatch[1]);
      return;
    }
    
    // DROP TABLE name
    const dropMatch = q.match(/drop\s+table\s+(\w+)/i);
    if (dropMatch) {
      this.analysis.tableName = dropMatch[1];
      this.analysis.symbolTable.addSymbol(dropMatch[1], 'TABLE', dropMatch[1]);
      console.log('✅ Table (DROP):', dropMatch[1]);
      return;
    }
    
    // ALTER TABLE name
    const alterMatch = q.match(/alter\s+table\s+(\w+)/i);
    if (alterMatch) {
      this.analysis.tableName = alterMatch[1];
      this.analysis.symbolTable.addSymbol(alterMatch[1], 'TABLE', alterMatch[1]);
      console.log('✅ Table (ALTER):', alterMatch[1]);
      return;
    }
  }

  // STEP 4: Extract WHERE conditions with proper operator conversion and quoting
  extractWhereCondition() {
    const whereMatch = this.query.match(/where\s+(.+?)(?:group|order|limit|$)/i);
    
    if (whereMatch) {
      let condition = whereMatch[1].trim();
      
      // Convert natural language operators to SQL with proper spacing
      // Handle "is" operator with proper quoting for string values
      condition = condition.replace(/\s+is\s+/gi, (match) => {
        // This will be handled after we identify if it's a string value
        return ' = ';
      });
      
      condition = condition
        .replace(/\s+is\s+not\s+/gi, ' != ')
        .replace(/\s+greater\s+than\s+or\s+equal\s+/gi, ' >= ')
        .replace(/\s+greater\s+than\s+/gi, ' > ')
        .replace(/\s+less\s+than\s+or\s+equal\s+/gi, ' <= ')
        .replace(/\s+less\s+than\s+/gi, ' < ')
        .replace(/\s+equals?\s+/gi, ' = ')
        .replace(/\s+like\s+/gi, ' LIKE ')
        .replace(/\s+contains\s+/gi, ' LIKE ');

      // Add quotes around string values after operators (for text values with spaces)
      condition = condition.replace(/(\w+)\s*=\s*([A-Za-z\s]+)(?=[,;)]|$)/g, (match, col, val) => {
        const trimmedVal = val.trim();
        // If value contains space or is text (not a number), quote it
        if (trimmedVal.match(/\s/) || isNaN(trimmedVal)) {
          return `${col} = '${trimmedVal}'`;
        }
        return `${col} = ${trimmedVal}`;
      });

      this.analysis.whereCondition = condition;
      this.analysis.symbolTable.addSymbol('WHERE', 'CLAUSE', condition);
      console.log('✅ WHERE:', condition);
    }
  }

  // STEP 5: Extract GROUP BY
  extractGroupBy() {
    const groupMatch = this.query.match(/group\s+by\s+(.+?)(?:having|order|limit|$)/i);
    
    if (groupMatch) {
      this.analysis.groupByColumns = groupMatch[1]
        .split(',')
        .map(c => c.trim());
      this.analysis.symbolTable.addSymbol('GROUP_BY', 'CLAUSE', groupMatch[1].trim());
      console.log('✅ GROUP BY:', this.analysis.groupByColumns);
    }
  }

  // STEP 5B: Extract HAVING clause
  extractHaving() {
    const havingMatch = this.query.match(/having\s+(.+?)(?:order|limit|$)/i);
    
    if (havingMatch) {
      let havingCondition = havingMatch[1].trim();
      
      // Convert natural language operators to SQL
      havingCondition = havingCondition
        .replace(/\s+is\s+not\s+/gi, ' != ')
        .replace(/\s+is\s+/gi, ' = ')
        .replace(/\s+greater\s+than\s+or\s+equal\s+/gi, ' >= ')
        .replace(/\s+greater\s+than\s+/gi, ' > ')
        .replace(/\s+less\s+than\s+or\s+equal\s+/gi, ' <= ')
        .replace(/\s+less\s+than\s+/gi, ' < ')
        .replace(/\s+equals?\s+/gi, ' = ')
        .replace(/\s+like\s+/gi, ' LIKE ')
        .replace(/\s+contains\s+/gi, ' LIKE ');

      this.analysis.havingCondition = havingCondition;
      this.analysis.symbolTable.addSymbol('HAVING', 'CLAUSE', havingCondition);
      console.log('✅ HAVING:', havingCondition);
    }
  }

  // STEP 6: Extract ORDER BY
  extractOrderBy() {
    const orderMatch = this.query.match(/order\s+by\s+(.+?)(?:limit|$)/i);
    
    if (orderMatch) {
      this.analysis.orderByColumns = [orderMatch[1].trim()];
      this.analysis.symbolTable.addSymbol('ORDER_BY', 'CLAUSE', orderMatch[1].trim());
      console.log('✅ ORDER BY:', this.analysis.orderByColumns);
    }
  }

  // STEP 7: Extract LIMIT
  extractLimit() {
    const limitMatch = this.query.match(/(?:limit|first|top)\s+(\d+)/i);
    
    if (limitMatch) {
      this.analysis.limitValue = parseInt(limitMatch[1]);
      this.analysis.symbolTable.addSymbol('LIMIT', 'CLAUSE', limitMatch[1]);
      console.log('✅ LIMIT:', this.analysis.limitValue);
    }
  }

  // STEP 8: Generate proper SQL based on RBNLP rules
  generateSQL() {
    if (!this.analysis.tableName && this.analysis.queryType !== 'SHOW' && 
        this.analysis.queryType !== 'SELECT' && this.analysis.queryType !== 'COUNT') {
      // For DDL/DML, table name extraction happens differently
      if (!this.analysis.tableName) {
        throw new Error('No valid operation or table found in query');
      }
    }

    let sql = '';

    // Handle DDL/DML operations
    if (this.analysis.queryType === 'CREATE') {
      // CREATE TABLE syntax: create table users with id name email phone
      const columnsMatch = this.query.match(/with\s+(.+?)$/i);
      if (columnsMatch) {
        const columns = columnsMatch[1].split(/\s+/).filter(c => c);
        const columnDefs = columns.map(col => `${col} TEXT`).join(', ');
        sql = `CREATE TABLE IF NOT EXISTS ${this.analysis.tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columnDefs})`;
      } else {
        sql = `CREATE TABLE IF NOT EXISTS ${this.analysis.tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT)`;
      }
    } else if (this.analysis.queryType === 'INSERT') {
      // INSERT syntax: insert into table_name values val1 val2 val3
      const valuesMatch = this.query.match(/values\s+(.+?)$/i);
      if (valuesMatch) {
        const values = valuesMatch[1].split(/\s+/).filter(v => v);
        const valuePlaceholders = values.map(v => `'${v}'`).join(', ');
        sql = `INSERT INTO ${this.analysis.tableName} VALUES (NULL, ${valuePlaceholders})`;
      } else {
        throw new Error('INSERT requires VALUES clause');
      }
    } else if (this.analysis.queryType === 'UPDATE') {
      // UPDATE syntax: update table set col val where condition
      const setMatch = this.query.match(/set\s+(\w+)\s+(.+?)(?:where|$)/i);
      if (setMatch) {
        const column = setMatch[1];
        const value = setMatch[2].trim();
        sql = `UPDATE ${this.analysis.tableName} SET ${column} = '${value}'`;
        
        if (this.analysis.whereCondition) {
          sql += ` WHERE ${this.analysis.whereCondition}`;
        }
      } else {
        throw new Error('UPDATE requires SET clause');
      }
    } else if (this.analysis.queryType === 'DELETE') {
      // DELETE syntax: delete from table where condition
      sql = `DELETE FROM ${this.analysis.tableName}`;
      
      if (this.analysis.whereCondition) {
        sql += ` WHERE ${this.analysis.whereCondition}`;
      }
    } else if (this.analysis.queryType === 'DROP') {
      // DROP syntax: drop table table_name
      sql = `DROP TABLE IF EXISTS ${this.analysis.tableName}`;
    } else if (this.analysis.queryType === 'ALTER') {
      // ALTER syntax: alter table table_name add column col_name
      const addMatch = this.query.match(/add\s+(?:column|field)\s+(\w+)/i);
      if (addMatch) {
        const newColumn = addMatch[1];
        sql = `ALTER TABLE ${this.analysis.tableName} ADD COLUMN ${newColumn} TEXT`;
      } else {
        throw new Error('ALTER requires ADD COLUMN/FIELD clause');
      }
    } else if (this.analysis.queryType === 'DELETE_COLUMN') {
      // DELETE COLUMN syntax: delete column col_name from table_name
      const deleteColMatch = this.query.match(/delete\s+(?:column|field)\s+(\w+)\s+from\s+(\w+)/i);
      if (deleteColMatch) {
        const column = deleteColMatch[1];
        const table = deleteColMatch[2];
        this.analysis.tableName = table;
        // SQLite doesn't support DROP COLUMN in older versions, so we use a comment
        sql = `-- Note: SQLite has limited ALTER TABLE DROP COLUMN support. To delete column: pragma writable_schema=1; UPDATE sqlite_master SET sql=REPLACE(sql,'${column} TEXT,','') WHERE type='table' AND name='${table}'; pragma writable_schema=0; VACUUM;`;
      } else {
        throw new Error('DELETE COLUMN requires syntax: delete column name from table');
      }
    } else if (this.analysis.queryType === 'COUNT') {
      if (!this.analysis.tableName) {
        throw new Error('No table found in query');
      }
      sql = `SELECT COUNT(*) FROM ${this.analysis.tableName}`;
    } else {
      // SELECT/SHOW queries
      if (!this.analysis.tableName) {
        throw new Error('No table found in query');
      }
      sql = `SELECT * FROM ${this.analysis.tableName}`;
      
      if (this.analysis.whereCondition) {
        sql += ` WHERE ${this.analysis.whereCondition}`;
      }
      
      if (this.analysis.groupByColumns.length > 0) {
        sql += ` GROUP BY ${this.analysis.groupByColumns.join(', ')}`;
      }
      
      if (this.analysis.havingCondition) {
        sql += ` HAVING ${this.analysis.havingCondition}`;
      }
      
      if (this.analysis.orderByColumns.length > 0) {
        sql += ` ORDER BY ${this.analysis.orderByColumns.join(', ')}`;
      }
      
      if (this.analysis.limitValue) {
        sql += ` LIMIT ${this.analysis.limitValue}`;
      }
    }

    console.log('✅ Generated SQL:', sql);
    return sql;
  }

  // STEP 9: Build parse tree
  buildParseTree() {
    const root = {
      type: 'RBNLP_Query',
      value: this.analysis.queryType,
      children: [
        {
          type: 'QueryType',
          value: this.analysis.queryType,
          children: []
        },
        {
          type: 'Table',
          value: this.analysis.tableName || 'NOT FOUND',
          children: []
        }
      ]
    };

    if (this.analysis.stopWords.length > 0) {
      root.children.push({
        type: 'StopWords',
        value: `${this.analysis.stopWords.length} detected`,
        children: this.analysis.stopWords.map(w => ({
          type: 'StopWord',
          value: w,
          children: []
        }))
      });
    }

    if (this.analysis.whereCondition) {
      root.children.push({
        type: 'WHERE',
        value: this.analysis.whereCondition,
        children: []
      });
    }

    if (this.analysis.groupByColumns.length > 0) {
      root.children.push({
        type: 'GROUP_BY',
        value: this.analysis.groupByColumns.join(', '),
        children: this.analysis.groupByColumns.map(c => ({
          type: 'Column',
          value: c,
          children: []
        }))
      });
    }

    this.analysis.parseTree = root;
  }

  // Main parse method
  parse() {
    console.log('\n' + '='.repeat(70));
    console.log('🧠 RBNLP PARSING:', this.query);
    console.log('='.repeat(70));

    this.tokenize();
    this.identifyQueryType();
    this.extractTableName();
    this.extractWhereCondition();
    this.extractGroupBy();
    this.extractHaving();
    this.extractOrderBy();
    this.extractLimit();
    this.buildParseTree();

    const sql = this.generateSQL();
    console.log('='.repeat(70) + '\n');

    // Convert symbol table to array for JSON serialization
    const symbolTableArray = this.analysis.symbolTable.getAll();
    console.log('📊 Symbol Table Array:', symbolTableArray);
    console.log('📊 Symbol Table Length:', symbolTableArray.length);

    const analysisForResponse = {
      original: this.analysis.original,
      tokens: this.analysis.tokens,
      stopWords: this.analysis.stopWords,
      removedStopWords: this.analysis.removedStopWords,
      queryType: this.analysis.queryType,
      tableName: this.analysis.tableName,
      columns: this.analysis.columns,
      whereCondition: this.analysis.whereCondition,
      havingCondition: this.analysis.havingCondition,
      groupByColumns: this.analysis.groupByColumns,
      orderByColumns: this.analysis.orderByColumns,
      limitValue: this.analysis.limitValue,
      symbolTable: symbolTableArray,
      parseTree: this.analysis.parseTree
    };

    return { sql, analysis: analysisForResponse };
  }
}

// ================= PARSE ENDPOINT =================
app.post('/parse', (req, res) => {
  let query = (req.body.query || '').trim();
  
  if (!query) {
    return res.status(400).json({ error: 'Query cannot be empty' });
  }

  try {
    const parser = new RBNLPParser(query);
    const { sql, analysis } = parser.parse();

    const schema = getDatabaseSchema();
    const tables = getTableNames();

    // Execute SQL
    let results = [];
    let success = false;
    let message = '';
    
    try {
      // For DDL/DML operations, use exec() instead of prepare().all()
      if (analysis.queryType === 'INSERT' || analysis.queryType === 'UPDATE' || 
          analysis.queryType === 'DELETE' || analysis.queryType === 'CREATE' ||
          analysis.queryType === 'DROP' || analysis.queryType === 'ALTER' ||
          analysis.queryType === 'DELETE_COLUMN') {
        
        // Execute DDL/DML and get changes
        db.exec(sql);
        results = [];
        success = true;
        
        // Set appropriate message
        if (analysis.queryType === 'INSERT') {
          message = 'Record inserted successfully';
        } else if (analysis.queryType === 'UPDATE') {
          message = 'Record updated successfully';
        } else if (analysis.queryType === 'DELETE') {
          message = 'Record(s) deleted successfully';
        } else if (analysis.queryType === 'CREATE') {
          message = 'Table created successfully';
        } else if (analysis.queryType === 'DROP') {
          message = 'Table dropped successfully';
        } else if (analysis.queryType === 'ALTER') {
          message = 'Table altered successfully';
        } else if (analysis.queryType === 'DELETE_COLUMN') {
          message = 'Column deleted successfully (Note: SQLite requires special handling for DROP COLUMN)';
        }
        
      } else {
        // For SELECT/SHOW queries, use prepare().all()
        results = db.prepare(sql).all();
        success = true;
        console.log(`✅ Query executed: ${results.length} rows`);
      }
    } catch (err) {
      return res.status(400).json({
        error: `Database error: ${err.message}`,
        sql,
        analysis,
        schema,
        tables
      });
    }

    res.json({
      sql,
      results,
      analysis,
      schema,
      tables,
      success: success,
      message: message,
      parser: 'RBNLP'
    });

  } catch (err) {
    console.error('❌ Parse Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});


// ================= HELP ENDPOINT =================
app.get('/help', (req, res) => {
  try {
    const schema = getDatabaseSchema();
    const tables = getTableNames();
    
    res.json({
      title: 'Rule-Based NLP SQL Generator',
      description: 'Convert rule based natural language to SQL using grammar rules',
      tables: tables,
      schema: schema,
      grammar_rules: {
        'SHOW': {
          keywords: 'show, display, list, view',
          description: 'Display records from a table'
        },
        'COUNT': {
          keywords: 'count, how many',
          description: 'Count records in a table'
        },
        'WHERE': {
          keywords: 'where, filter, having',
          description: 'Filter records by conditions'
        },
        'GROUP_BY': {
          keywords: 'group by, grouped by',
          description: 'Group results by column'
        },
        'ORDER_BY': {
          keywords: 'order by, sort, arrange',
          description: 'Sort results by column'
        },
        'LIMIT': {
          keywords: 'limit, first, top',
          description: 'Limit number of results'
        },
        'COMPARISONS': {
          'equal': 'is, equals, equal to → =',
          'not equal': 'is not, not equal → !=',
          'greater': 'greater than, more than → >',
          'greater_equal': 'greater than or equal, at least → >=',
          'less': 'less than, fewer than → <',
          'less_equal': 'less than or equal, at most → <=',
          'like': 'contains, like, search → LIKE'
        }
      },
      // CORRECTED EXAMPLES - All working with actual database
      query_examples: {
        'BASIC_SHOW': [
          'show lakshya',
          'show students',
          'show employees',
          'display products',
          'list departments'
        ],
        'WITH_WHERE_EQUALS': [
          'show lakshya where course is Data Science',
          'show students where course is Computer Science',
          'show employees where department is IT',
          'show products where category is Electronics',
          'show orders where product_id is 1'
        ],
        'WITH_WHERE_GREATER': [
          'show students where age greater than 20',
          'show employees where salary greater than 65000',
          'show products where price greater than 100',
          'show lakshya where gpa greater than 3.7',
          'show orders where quantity greater than 2'
        ],
        'WITH_WHERE_LESS': [
          'show products where price less than 100',
          'show students where gpa less than 3.8',
          'show employees where salary less than 70000',
          'show lakshya where age less than 23',
          'show orders where quantity less than 3'
        ],
        'WITH_GROUP_BY': [
          'show lakshya group by course',
          'show students group by course',
          'show employees group by department',
          'show products group by category',
          'show orders group by product_id'
        ],
        'WITH_ORDER_BY': [
          'show students order by gpa',
          'show employees order by salary',
          'show products order by price',
          'show lakshya order by age',
          'show orders order by total_amount'
        ],
        'WITH_LIMIT': [
          'show students limit 2',
          'show employees first 3',
          'show products top 2',
          'show lakshya limit 2',
          'show orders limit 3'
        ],
        'COUNT_QUERIES': [
          'count lakshya',
          'count students',
          'count employees',
          'count products',
          'count orders'
        ],
        'COMPLEX_WHERE_AND_GROUP': [
          'show lakshya where gpa greater than 3.5 group by course',
          'show employees where salary greater than 60000 group by department',
          'show products where price greater than 50 group by category',
          'show students where age greater than 19 group by course',
          'show orders where quantity greater than 1 group by product_id'
        ],
        'COMPLEX_WHERE_AND_ORDER': [
          'show students where age greater than 19 order by gpa',
          'show employees where salary greater than 60000 order by salary',
          'show products where price greater than 50 order by price',
          'show lakshya where gpa greater than 3.5 order by age',
          'show orders where quantity greater than 1 order by total_amount'
        ],
        'COMPLEX_WHERE_AND_LIMIT': [
          'show students where age greater than 20 limit 2',
          'show employees where salary greater than 65000 limit 1',
          'show products where price greater than 100 limit 2',
          'show lakshya where gpa greater than 3.7 limit 1',
          'show orders where quantity greater than 1 limit 2'
        ],
        'HAVING_QUERIES': [
          'show employees group by department having salary greater than 60000',
          'show lakshya group by course having gpa greater than 3.5',
          'show students group by course having age greater than 20',
          'show orders group by product_id having quantity greater than 1',
          'show products group by category having price greater than 100'
        ],
        'INSERT_DATA': [
          'insert into lakshya values lakshya Sharma 25 lakshya@email.com Cloud 3.95',
          'insert into students values Sarah Davis 20 sarah@example.com Physics 3.85',
          'insert into employees values Frank Wilson Finance 72000',
          'insert into products values Tablet 450 120 Electronics 1',
          'insert into departments values Operations 250000 5'
        ],
        'UPDATE_DATA': [
          'update students set age 21 where name is John Doe',
          'update employees set salary 75000 where department is IT',
          'update products set price 299 where name is Monitor',
          'update lakshya set gpa 3.95 where course is Data Science',
          'update orders set quantity 5 where product_id is 2'
        ],
        'DELETE_DATA': [
          'delete from students where age less than 18',
          'delete from employees where salary less than 50000',
          'delete from products where stock less than 10',
          'delete from orders where product_id is 5',
          'delete from lakshya where gpa less than 3.0'
        ],
        'CREATE_TABLE': [
          'create table users with id name email phone',
          'create table projects with id title description budget',
          'create table inventory with id item_name quantity warehouse',
          'create table courses with id course_name credits department',
          'create table transactions with id amount date account'
        ],
        'DROP_TABLE': [
          'drop table users',
          'drop table temp_data',
          'drop table old_records',
          'drop table archive',
          'drop table backup'
        ],
        'ALTER_TABLE': [
          'alter table students add column phone_number',
          'alter table employees add field joining_time',
          'alter table products add column supplier_name',
          'alter table lakshya add field enrollment_status',
          'alter table orders add column shipping_address'
        ],
        'DELETE_COLUMN': [
          'delete column phone_number from students',
          'delete field age from employees',
          'delete column category from products',
          'delete field gpa from lakshya',
          'delete column order_date from orders'
        ]
      },
      features: [
        'Rule-Based NLP for natural language processing',
        'Grammar-based SQL generation',
        'Stop words detection and removal',
        'Proper operator conversion (is → =, greater than → >)',
        'Complete query analysis with parse tree',
        'Symbol table tracking',
        'Accurate database schema mapping'
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SCHEMA ENDPOINT =================
app.get('/schema', (req, res) => {
  try {
    const schema = getDatabaseSchema();
    res.json({ schema, tables: getTableNames() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DATABASES ENDPOINT =================
app.get('/databases', (req, res) => {
  try {
    res.json(getTableNames().map(name => ({ name })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= VIEW TABLE ENDPOINT =================
app.get('/view-table/:tableName', (req, res) => {
  try {
    const actualName = getActualTableName(req.params.tableName);
    
    if (!actualName) {
      return res.status(400).json({ error: 'Table not found' });
    }

    const data = db.prepare(`SELECT * FROM ${actualName} LIMIT 100`).all();
    const columns = getTableColumns(actualName);
    res.json({ tableName: actualName, data, columns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SERVER START =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(70));
  console.log("🧠 RBNLP SQL GENERATOR - RULE-BASED NLP");
  console.log("=".repeat(70));
  console.log(`✅ Server: http://127.0.0.1:${PORT}`);
  console.log(`📊 Tables: ${getTableNames().join(', ')}`);
  console.log(`🔧 Parser: RBNLP (Rule-Based Natural Language Processing)`);
  console.log("=".repeat(70) + "\n");
});