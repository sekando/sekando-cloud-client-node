#!/bin/sh
export SEKANDO_PROJECT_ID="test-project"
export SEKANDO_API_KEY="03f2405d-65b4-4ba2-925a-d25eb34c2625"
export SEKANDO_API_SECRET="31c939e2f35960ea0244707c8cfaf58c8041474d11ea60f055efa451c2ba4808"
export SEKANDO_TEST_CLUSTER_ID="test-cluster"
export SEKANDO_API_ROOT="https://stage.sekando.com/api/v1"
istanbul cover _mocha -- $1 --recursive --timeout 30000