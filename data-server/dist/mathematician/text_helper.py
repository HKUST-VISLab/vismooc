import nltk
from nltk import tokenize
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


class SentimentAnalyzer():
    ''' This is class is for basic sentiment analysis
    '''
    neutral_threshold = [-0.3, 0.3]

    def __init__(self):
        nltk.download('punkt')
        self.analyzer = SentimentIntensityAnalyzer()

    def analysis(self, paragraph):
        ''' analysis sentiment given paragraph
        '''
        result = 0
        counter = 0
        sentences = tokenize.sent_tokenize(paragraph)
        for sentence in sentences:
            sentiment = self.analyzer.polarity_scores(sentence)['compound']
            if sentiment > SentimentAnalyzer.neutral_threshold[0] and \
                sentiment < SentimentAnalyzer.neutral_threshold[1]:
                continue

            counter += 1
            result += sentiment

        result = result / float(counter) if counter > 0 else 0
        return result
