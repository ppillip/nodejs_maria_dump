var exec = require('child_process').exec;
var util = require('util');
var inspect = require('util').inspect;
var Client = require('mariasql');

require('date-utils');

var tables = []; //["KD_BRCH","KD_CUST","KD_HLDY","KD_ODAT","KD_TMPR"];

var date = new Date();
var folder = "/home/kdhec/ntels/backup/" + date.toFormat("YYYY.MM.DD.HHMISS") + "/";
var mariaInfo = {
  host: '아이피어드레스',
  user: '사용자',
  password: '비밀번호',
  db: '디비명'
};
var dumpOption = "--no-create-db --set-charset --default-character-set=utf8 --lock-tables=0";

console.log(folder);


var c = new Client();
c.connect(mariaInfo);
c.on('connect', function() {
   console.log('Client connected');
 })
 .on('error', function(err) {
   console.log('Client error: ' + err);
 })
 .on('close', function(hadError) {
   console.log('Client closed');
 });

var pq = c.prepare('show tables');

c.query(pq({}))
 .on('result', function(res) {
   res.on('row', function(row) {
   	 tables.push(row.Tables_in_kdhec_db);
   })
   .on('error', function(err) {
     console.log('Result error: ' + inspect(err));
   })
   .on('end', function(info) {
	 console.log(tables);
		exec("mkdir " + folder,function(){
		
			for (i = 0; i < tables.length; i++) {
				(function(table){
					var dumpStr = "mysqldump -h " + mariaInfo.host 
								+ " -u" + mariaInfo.user 
								+ " -p" + mariaInfo.password 
								+ " " + dumpOption + " " + mariaInfo.db ;
					dumpStr = dumpStr + table + "> " + folder + "/" + table + ".sql";

					console.log(table + " started");
		
					exec(dumpStr,function(error, stdout, stderr){
					    //console.log('stdout: ' + stdout);
					    //console.log('stderr: ' + stderr);
					    if (error !== null) {
					      console.log('exec error: ' + error);
					    }
					    console.log(table + " 완료");
					});		
		
				})(tables[i]);
			}
		
		});
   });
 })
 .on('end', function() {
   console.log('Done with all results');
 });

c.end();
