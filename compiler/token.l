%{
#include "nlqp.tab.h"
#include <string.h>
#include <stdlib.h>
%}

%%

"show"     return SHOW;
"select"   return SELECT;

/* ignore words */
"me" ;
"the" ;
"data" ;
"of" ;
"is" ;
"please" ;
"give" ;
"all" ;
"from" ;


[a-zA-Z_][a-zA-Z0-9_]* {
    yylval.str = strdup(yytext);
    return IDENTIFIER;
}

[ \t\n\r]+ ;

. ;

%%

int yywrap() {
    return 1;
}