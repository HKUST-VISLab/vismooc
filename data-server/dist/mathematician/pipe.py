# -*- coding: utf-8 -*-
from abc import ABCMeta, abstractmethod
from datetime import datetime


class PipeModule(metaclass=ABCMeta):
    """An abstract class. All processing module who should be past
    to a pipline need to inherient
    """

    order = 1

    def __init__(self):
        pass

    @abstractmethod
    def process(self, raw_data, raw_data_filenames=None):
        """Required.Process the raw data and return the processed data

        Args:
            raw_data (dict): The first parameter.

        Returns:
            dict: The return value, processed data.
        """
        pass


class PipeLine:
    """A pipeline class, which is used to schedule the pipeline of
    data processing.

    Attributes:
        __raw_data (dict): raw data need to be processed.
        __processed_data (dict): data after processing.
    """

    def __init__(self):
        self.__raw_data_filenames = []
        self._processed_data = None
        self._processors = []

    def input_file(self, filename):
        '''Put in the path to the input file
        '''
        if isinstance(filename, str) is False or len(filename) == 0:
            raise TypeError('filename should be a non-empty str')
        self.__raw_data_filenames.append(filename)
        return self

    def input_files(self, filenames):
        '''Put in the list of path to the input file
        '''
        if isinstance(filenames, list) is False:
            raise TypeError('filenames should be a non-empty list')
        self.__raw_data_filenames += filenames
        return self

    def pipe(self, processor):
        """
            Register the processor in this pipeline. All processors will be excuted one by one
            according to their order, which is default to 1.
            If no order is defined, all processors will be excuted in the order of their
            registration.
        """
        if isinstance(processor, PipeModule) is False:
            raise TypeError('processor must be an instance of PipeModule')
        self._processors.append(processor)
        return self

    # def concat(self, pipeline):
    #     """
    #         Concatenate another pipeline to this pipeline
    #     """
    #     return self

    def execute(self):
        """
            Execute all processor one by one

        """
        self._processed_data = {'created_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                'data': {}}
        for processor in sorted(self._processors, key=lambda d: d.order):
            self._processed_data = processor.process(self._processed_data,
                                                     self.__raw_data_filenames)
            self._processed_data['finished_date'] = datetime.now(
            ).strftime('%Y-%m-%d %H:%M:%S')

        return self

    def output(self):
        """
            Excute all processor one by one and return the data after processing
        """
        if self._processed_data is None:
            self.execute()
        return self._processed_data
