#!/bin/bash
#
# pgdiff.sh runs a compare on each schema type in the order that usually creates the fewest conflicts.  
# At each step you are allowed to review and change the generated SQL before optionally running it.   
# You are also allowed to rerun the diff on a type before continuing to the next type.  This is
# helpful when, for example dependent views are defined in the file before the view it depends on.
#
# If you convert this to a windows batch file (or, even better, a Go program), please share it.
#
# Example:
# pgdiff -U postgres -W supersecret -H dbhost1 -P 5432 -D maindb    -O 'sslmode=disable' \
#        -u postgres -w supersecret -h dbhost2 -p 5432 -d stagingdb -o 'sslmode=disable' \
#        COLUMN
#

[[ -z $USER1 ]] && USER1=postgres
[[ -z $HOST1 ]] && HOST1=10.0.0.111
[[ -z $PORT1 ]] && PORT1=5432
[[ -z $NAME1 ]] && NAME1='gpr-dev01'
[[ -z $OPT1 ]]  && OPT1='sslmode=disable'

[[ -z $USER2 ]] && USER2=postgres
[[ -z $HOST2 ]] && HOST2=10.0.0.111
[[ -z $PORT2 ]] && PORT2=5432
[[ -z $NAME2 ]] && NAME2='gpr-prod'
[[ -z $OPT2 ]]  && OPT2='sslmode=disable'

echo "This is the reference database:"
echo "   ${USER1}@${HOST1}:${PORT1}/$NAME1"
#read -sp "Enter DB password: " passw
#PASS1=$passw
#PASS2=$passw

echo
echo "This database may be changed (if you choose):"
echo "   ${USER2}@${HOST2}:${PORT2}/$NAME2"
#read -sp "Enter DB password (defaults to previous password): " passw
#[[ -n $passw ]] && PASS2=$passw
echo
PASS1='Justice##@!1996'
PASS2='Justice##@!1996'

sqlFile="temp.sql"
sqlFileAll="output.sql"

rm "$sq1File"
rm "$sqlFileAll"

let i=0
function rundiff() {
    ((i++))
    local TYPE=$1
#    local sqlFile="${i}-${TYPE}.sql"
    local rerun=yes
    while [[ $rerun == yes ]]; do
        rerun=no
        echo "Generating diff for $TYPE... "
        ./pgdiff -U "$USER1" -W "$PASS1" -H "$HOST1" -P "$PORT1" -D "$NAME1" -O "$OPT1" \
                 -u "$USER2" -w "$PASS2" -h "$HOST2" -p "$PORT2" -d "$NAME2" -o "$OPT2" \
                 $TYPE > "$sqlFile"
        rc=$? && [[ $rc != 0 ]] && exit $rc

	cat "$sqlFile" >> "$sqlFileAll"

#        if [[ $(cat "$sqlFile" | wc -l) -gt 4 ]]; then
#            vi "$sqlFile"
#            read -p "Do you wish to run this against ${NAME2}? [yN]: " yn
#            if [[ $yn =~ ^y ]]; then
#                PGPASSWORD="$PASS2" ./pgrun -U $USER2 -h $HOST2 -p $PORT2 -d $NAME2 -O "$OPT2" -f "$sqlFile"
#                read -p "Rerun diff for $TYPE? [yN]: " yn
#                [[ $yn =~ ^[yY] ]] && rerun=yes
#            fi
#        else
#            read -p "No changes found for $TYPE (Press Enter) " x
#        fi
    done
    echo
}

rundiff FUNCTION
rundiff ROLE
rundiff SEQUENCE
rundiff TABLE
rundiff COLUMN
rundiff VIEW
rundiff OWNER
rundiff INDEX
rundiff FOREIGN_KEY
rundiff GRANT_RELATIONSHIP
rundiff GRANT_ATTRIBUTE
rundiff TRIGGER

rm "$sqlFile"
cat "$sqlFileAll"

read -p "Do you wish to run this against ${NAME2}? [yN]: " yn

if [[ $yn =~ ^y ]]; then
	PGPASSWORD="$PASS2" ./pgrun -U $USER2 -h $HOST2 -p $PORT2 -d $NAME2 -O "$OPT2" -f "$sqlFileAll"
fi


echo "Done!"

