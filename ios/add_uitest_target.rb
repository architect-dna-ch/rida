#!/usr/bin/env ruby
# Run once locally: ruby ios/add_uitest_target.rb
# Adds an AppUITests target to App.xcodeproj

require 'xcodeproj'

PROJECT_PATH = File.expand_path('../App/App.xcodeproj', __FILE__)
TEST_DIR     = File.expand_path('../App/AppUITests', __FILE__)

proj = Xcodeproj::Project.open(PROJECT_PATH)

# Don't add twice
if proj.targets.any? { |t| t.name == 'AppUITests' }
  puts "AppUITests target already exists — nothing to do."
  exit 0
end

app_target = proj.targets.find { |t| t.name == 'App' }
raise "Could not find App target" unless app_target

# Create UI test target
test_target = proj.new_target(:ui_test_bundle, 'AppUITests', :ios, '16.0')
test_target.add_dependency(app_target)

# Add source files
group = proj.main_group.find_subpath('App/AppUITests', true)
group.set_source_tree('<group>')
group.set_path('AppUITests')

['ScreenshotTests.swift', 'SnapshotHelper.swift'].each do |f|
  file_ref = group.new_file(f)
  test_target.source_build_phase.add_file_reference(file_ref)
end

# Build settings
test_target.build_configurations.each do |config|
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'ch.architectdna.rida.uitests'
  config.build_settings['TEST_TARGET_NAME']           = 'App'
  config.build_settings['SWIFT_VERSION']              = '5.0'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
  config.build_settings['CODE_SIGN_IDENTITY']         = ''
  config.build_settings['CODE_SIGNING_REQUIRED']      = 'NO'
end

proj.save
puts "Done — AppUITests target added to #{PROJECT_PATH}"
