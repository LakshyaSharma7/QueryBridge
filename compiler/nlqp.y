%{
#include <stdio.h>
#include <stdlib.h>

void yyerror(const char *s);
int yylex();
%}

/* define value type */
%union {
    char* str;
}

%token SHOW SELECT
%token <str> IDENTIFIER

%%

query:
    SHOW IDENTIFIER {
        printf("SELECT * FROM %s;\n", $2);
    }
    |
    SELECT IDENTIFIER {
        printf("SELECT * FROM %s;\n", $2);
    }
    ;

%%

void yyerror(const char *s) {
    printf("Parsing failed.\n");
}

int main() {
    yyparse();
    return 0;
}