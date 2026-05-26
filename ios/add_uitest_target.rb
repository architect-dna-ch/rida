#!/usr/bin/env ruby
# Run once locally: ruby ios/add_uitest_target.rb
# Adds AppUITests target + wires it into the App scheme's test action

require 'xcodeproj'

PROJECT_PATH = File.expand_path('../App/App.xcodeproj', __FILE__)
TEST_DIR     = File.expand_path('../App/AppUITests', __FILE__)

proj = Xcodeproj::Project.open(PROJECT_PATH)

app_target = proj.targets.find { |t| t.name == 'App' }
raise "Could not find App target" unless app_target

# Add target only if missing
unless proj.targets.any? { |t| t.name == 'AppUITests' }
  test_target = proj.new_target(:ui_test_bundle, 'AppUITests', :ios, '16.0')
  test_target.add_dependency(app_target)

  group = proj.main_group.find_subpath('App/AppUITests', true)
  group.set_source_tree('<group>')
  group.set_path('AppUITests')

  ['ScreenshotTests.swift', 'SnapshotHelper.swift'].each do |f|
    file_ref = group.new_file(f)
    test_target.source_build_phase.add_file_reference(file_ref)
  end

  test_target.build_configurations.each do |config|
    config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'ch.architectdna.rida.uitests'
    config.build_settings['TEST_TARGET_NAME']           = 'App'
    config.build_settings['SWIFT_VERSION']              = '5.0'
    config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
    config.build_settings['CODE_SIGN_IDENTITY']         = ''
    config.build_settings['CODE_SIGNING_REQUIRED']      = 'NO'
  end

  proj.save
  puts "AppUITests target added."
end

# Wire into App scheme test action
scheme_path = Xcodeproj::XCScheme.shared_data_dir(PROJECT_PATH) + 'App.xcscheme'
if File.exist?(scheme_path)
  scheme = Xcodeproj::XCScheme.new(scheme_path)
else
  scheme = Xcodeproj::XCScheme.new
end

test_target = proj.targets.find { |t| t.name == 'AppUITests' }
already_added = scheme.test_action.testables.any? do |t|
  t.buildable_references.any? { |r| r.target_name == 'AppUITests' }
end

unless already_added
  testable = Xcodeproj::XCScheme::TestAction::TestableReference.new(test_target)
  testable.skipped = false
  scheme.test_action.testables << testable
  scheme.save_as(PROJECT_PATH, 'App', true)
  puts "AppUITests wired into App scheme test action."
end

puts "Done."
