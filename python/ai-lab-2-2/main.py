from sklearn import datasets
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
from sklearn.metrics import recall_score
from sklearn.metrics import precision_score
from sklearn.metrics import precision_recall_curve
from sklearn.model_selection import train_test_split
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from random import shuffle


# draw the decision boundary
def plot_decision_boundary(model, x_train):
    h = .02
    x_min, x_max = x_train[:, 0].min() - .5, x_train[:, 0].max() + .5
    y_min, y_max = x_train[:, 1].min() - .5, x_train[:, 1].max() + .5
    xx, yy = np.meshgrid(np.arange(x_min, x_max, h), np.arange(y_min, y_max, h))
    zz = model.predict(np.c_[xx.ravel(), yy.ravel()])
    zz = zz.reshape(xx.shape)
    custom_cmap = ListedColormap(['#A0FFA0', '#FFA0A0', '#A0A0FF'])
    plt.pcolormesh(xx, yy, zz, cmap=custom_cmap, shading='auto')


def main():
    # load the datasets and separate the test and train data
    data_set = datasets.load_iris()
    x_train, x_test, y_train, y_test = train_test_split(data_set.data[:, 0:2], data_set.target, train_size=130)
    # set the model and train the data
    clf = SVC(C=0.8, kernel='rbf', gamma=20, decision_function_shape='ovr')
    clf.fit(x_train, y_train)

    plt.subplot(211)
    plot_decision_boundary(clf, x_train)
    my_cmap = ListedColormap(['g', 'r', 'b'])
    plt.scatter(x_train[:, 0], x_train[:, 1], c=y_train, edgecolors='k', s=50, cmap=my_cmap)
    plt.subplot(212)

    # get the accuracy, precision and recall
    print('the svm accuracy:{}'.format(accuracy_score(y_test, clf.predict(x_test))))
    print('the svm macro recall:{}'.format(recall_score(y_test, clf.predict(x_test), average='macro')))
    print('the svm macro precision:{}'.format(precision_score(y_test, clf.predict(x_test), average='macro')))
    print('the svm micro recall:{}'.format(recall_score(y_test, clf.predict(x_test), average='macro')))
    print('the svm micro precision:{}'.format(precision_score(y_test, clf.predict(x_test), average='macro')))
    precision, recall, _ = precision_recall_curve(y_test, clf.predict(x_test), pos_label=2)
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    print(precision, recall)
    print(y_test, clf.predict(x_test))
    plt.figure(1)
    plt.plot(precision, recall)
    plt.show()


if __name__ == '__main__':
    main()
