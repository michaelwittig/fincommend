library(recommenderlab)
library(rmongodb)


args <- commandArgs(trailingOnly = TRUE)


mongo_host <- "cmeasy.cinovo.de:27017"
mongo_db <- "cmeasy"
mongo_col <- "cmeasy.portfolioUsers"

# data("MSWeb")
# MSWeb10 <- sample(MSWeb[rowCounts(MSWeb) >10,], 100)
# rec <- Recommender(MSWeb10, method = "POPULAR");

mongo <- mongo.create(host = mongo_host, db = mongo_db)
# customer_id <- args[1]

# curr_portfolio <- mongo.find.one(mongo, mongo_col, paste('{"_id":"', customer_id, '"}', sep = ""))

# curr_portfolio <- mongo.bson.to.list(curr_portfolio)

# test <- mongo.find.all(mongo, mongo_col)



portfolios <- mongo.distinct(mongo, mongo_col, '_id')

isins <- mongo.distinct(mongo, mongo_col, 'portfolio.isin')

# bla <- "KPwuZNECWHdrNpnp7"
bla <- args[1]

portfolio_train <- matrix(data = 0, nrow = length(portfolios), ncol = length(isins))
rownames(portfolio_train) <- portfolios
colnames(portfolio_train) <- isins #, "Aktie 4", "Aktie 5", "Aktie 6", "Aktie 7", "Aktie 8", "Aktie 9", "Aktie 10")

for(i in portfolios){
	# i <- "KPwuZNECWHdrNpnp7"
	curr_portfolio <- mongo.find.one(mongo, mongo_col, paste('{"_id":"', i, '"}', sep = ""))
	curr_portfolio <- mongo.bson.to.list(curr_portfolio)
	for(j in 1:length(curr_portfolio$portfolio)){
		curr_paper <- curr_portfolio$portfolio[[j]]$isin
		portfolio_train[i, curr_paper] <- 1
	}
}
# portfolio_train[1,] <- c(1, NA, 4)
# portfolio_train[2,] <- c(1, NA, 4)
# portfolio_train[3,] <- c(7, NA, 10)
# portfolio_train[4,] <- c(1, NA, 7)
# portfolio_train[5,] <- c(NA, 5, 6)
# portfolio_train[6,] <- c(1, NA, NA)

my_portfolio_id <- which(portfolios == bla)

portfolio_train_bm <- as(portfolio_train, "binaryRatingMatrix")

# # my_recommender <- Recommender(data = portfolio_train_bm, method = "IBCF")

if(args[2] == "social"){
	my_recommender <- Recommender(data = portfolio_train_bm[-my_portfolio_id], method = "IBCF")

	recom <- predict(my_recommender, portfolio_train_bm[my_portfolio_id], n=20)
	recom_ratings <- predict(my_recommender, portfolio_train_bm[my_portfolio_id], n=20, type = "ratings")

	output <- as(recom, "list")[[1]]
	output_ratings <- as(recom_ratings, "list")
	
	for(i in 1:length(output)){
		print(paste(output[i], output_ratings[[output[i]]]))
	}
}

if(args[2] == "popular"){
	my_recommender <- Recommender(data = portfolio_train_bm[-my_portfolio_id], method = "POPULAR")

	recom <- predict(my_recommender, portfolio_train_bm[my_portfolio_id], n=20)

	output <- as(recom, "list")[[1]]

	for(i in 1:length(output)){
		print(paste(output[i], mean(portfolio_train[-my_portfolio_id, output[i]])))
	}
}

# my_recommender_new <- sample(my_recommender, 5, replace=TRUE)