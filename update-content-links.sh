#!/bin/sh

find * -prune -lname _intro_frame.php | xargs git rm
git status
for f in content/*.html
do
	link=`basename "$f" .html`.php
	ln -v -s _intro_frame.php "$link"
	git add "$link"
done
