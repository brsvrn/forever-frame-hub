@echo off
del typecheck_out.txt 2>nul
del typecheck_out2.txt 2>nul
del commit.bat 2>nul
git rm --cached typecheck_out.txt typecheck_out2.txt 2>nul
git add -A
git commit --message "chore: remove temp typecheck output files"
