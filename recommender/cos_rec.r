library(lsa)
library(rmongodb)

load(file = "instr_sim.RData")

args <- commandArgs(trailingOnly = TRUE)

mongo_host <- "cmeasy.cinovo.de:27017"
mongo_db <- "cmeasy"
mongo_col <- "cmeasy.portfolioUsers"



mongo <- mongo.create(host = mongo_host, db = mongo_db)
customer_id <- args[1]


curr_portfolio <- mongo.find.one(mongo, mongo_col, paste('{"_id":"', customer_id, '"}', sep = ""))

curr_portfolio <- mongo.bson.to.list(curr_portfolio)

number_of_portfolio <- length(curr_portfolio$portfolio)

isins <- c()

for(j in 1:number_of_portfolio){
	isins <- c(isins, curr_portfolio$portfolio[[j]]$isin)
}

# isins <- c("ARSIDE010029", "ARP432631215", "BMG2125C1029")

# print(isins)

isins <- isins[which(isins %in% colnames(instr_sim))]

rankings <- apply(instr_sim[isins,], 2, mean)

# rankings <- rankings[which(names(rankings) %in% isins)]

top_30_rankings <- rankings[order(rankings, decreasing = TRUE)[1:30]]
top_rankings <- c()

for(i in 1:30){
	if(names(top_30_rankings[i]) %in% isins){
	} else{
		top_rankings <- c(top_rankings, top_30_rankings[i])
	}
	# to_print <- paste(names(rankings[order(rankings, decreasing = TRUE)[i]]), rankings[order(rankings, decreasing = TRUE)[i]])
	# print(to_print)
}

for(i in 1:length(top_rankings)){
	to_print <- paste(names(top_rankings[i]), top_rankings[i])
	print(to_print)
}

# print(args[1])

mongo.destroy(mongo)