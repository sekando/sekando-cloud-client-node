#!/bin/sh
export SEKANDO_PROJECT_ID="test-project"
export SEKANDO_API_KEY="80402d99-2f73-4fa7-a73e-1cf4ed0eadba"
export SEKANDO_API_SECRET="a282eb94ee4f10b258ae8f171e7dea6983d8233b82a669fab49e7b5f19bccf15"
export SEKANDO_API_ROOT="http://localhost:8200/api/v1"
export SEKANDO_TEST_CLUSTER_ID="test-cluster"
istanbul cover _mocha -- $1 --recursive --timeout 30000