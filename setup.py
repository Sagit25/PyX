
from setuptools import setup, find_packages

setup(
    name='pyx',
    version='0.0.1',
    description='A framework that enables Python objects to be easily rendered on a web server',
    author='Changyeon Kim',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    include_package_data=True,
    zip_safe=False,
    license='MIT'
)

